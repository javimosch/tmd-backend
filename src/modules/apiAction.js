import {
	IS_PRODUCTION
} from '../config';
import config from '../config'
import db from './db';
import * as sander from 'sander';
import sequential from 'promise-sequential';
import path from 'path';
import * as babel from 'babel-core';
import middlewares from './apiActionMiddlewares'
import _ from 'lodash';

const console = require('tracer').colorConsole();
var beautify = require('js-beautify').js_beautify;
var errToJSON = require('error-to-json')
var requireFromString = require('require-from-string', '', [
	//__dirname,
	//path.join(__dirname,'..')
	process.cwd()
]);

let state = {
	docs: [],
	modules: {}
};


async function getModules() {
	if (_.keys(state.modules).length > 0) return state.modules;
	let dirs = await sander.readdir(path.join(__dirname))
	//d.indexOf('apiAction.js') === -1 &&
	let res = await sequential(dirs.filter(d =>  d.indexOf('.js') !== -1).map(d => {
		return async () => ({
			name: d.replace('.js', ''),
			def: require('./' + d)
		})
	}))
	res.forEach(r => state.modules[r.name] = r.def)
	return state.modules;
}


function sendSuccess(data, res) {
	res.status(200).json({
		data: data || null
	});
}

function sendBadParam(msg, res) {
	res.status(400).json({
		data: null,
		err: msg,
	});
}

function sendBadActionImplementation(msg, res) {
	res.status(500).json({
		err: msg,
	});
}

function sendServerError(err, res) {
	let errObject = errToJSON(err);
	if (process.env.ERRORS_RES_MODE === 'message') {
		errObject = {
			message: errObject.message
		}
	}
	let detail = JSON.stringify(errObject, null, 2);
	res.status(500).json({
		data: null,
		err: !IS_PRODUCTION ? detail : JSON.stringify({
			message: "Server error"
		}, null, 2)
	});
}

export function handler() {
	return async function(req, res) {
		let payload = req.body;

		if (!payload.n) return sendBadParam('Action name required (n)', res);
		if (!payload.d) return sendBadParam('Action data required (d)', res);
		if (typeof payload.d !== 'object') return sendBadParam('Action data type mismatch (object expected)', res);

		let doc = state.docs.filter(d => d.name == payload.n)[0];

		if (!doc) return sendBadParam('Action mistmach: ' + payload.n, res);

		let def = requireFromString(doc.compiledCode);

		const functionScope = {
			model: (n) => db.conn().model(n),
			db,
			sequential,
			req,
			config,
			modules: await getModules()
		};

		//middlewares
		if (def.middlewares) {
			try {
				await middlewares.run(doc, def, functionScope, payload.d);
			} catch (err) {
				console.warn('Action', doc.name, 'middleware exit')
				return sendServerError(err, res);
			}
		} else {
			console.info('Runing', doc.name, 'without middlewares')
		}

		let p = def.default.apply(functionScope, [payload.d])
		if (p && p.then && p.catch) {
			(async () => {
				let actionResponseData = await p;
				actionResponseData = await middlewares.runPost(doc, def, functionScope, actionResponseData)
				console.info('Success', actionResponseData)
				sendSuccess(actionResponseData, res);
			})().catch(err => {
				console.log(err);
				sendServerError(err, res)
			});

		} else {
			return sendBadActionImplementation('Action should return a promise', res);
		}


	}
}

export async function sync() {

	await sander.rimraf(path.join(__dirname, '../actions/temp/*.js'));
	let ApiAction = db.conn().model('api_action');
	let len = await ApiAction.count({}).exec();
	if (len === 0) {
		await ApiAction.create({
			name: "hello_world",
			code: `
export default async function(data){
	return console.log('Hello '+data.name);
}
			`
		})
	}

	try {
		await getModules()
	} catch (err) {
		console.error('It should be able to read modules')
		process.exit(1);
	}


	if (!IS_PRODUCTION) {
		await middlewares.sync()
		await saveOrUpdateLocalActions(ApiAction);
	}

	await middlewares.load()


	state.docs = await ApiAction.find({}).exec();
	state.docs = state.docs.filter(d => {
		if (d.name.indexOf(' ') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		if (d.name.indexOf('$') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		if (d.name.indexOf('-') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		return true;
	});
	await compileActions(state.docs);
	state.docs = state.docs.filter(d => !d.hasErrors);
	return;
}

export async function updateActions(docs) {
	console.log('Compiling actions',docs.map(d=>d.name))
	await compileActions(docs);
	// Iterate over first array of objects
	_.map(state.docs, function(obj) {
		// add the properties from second array matching the userID
		// to the object from first array and return the updated object
		return _.assign(obj, _.find(docs, {
			_id: obj._id
		}));
	});
	state.docs = state.docs.concat(
		docs.filter(d=> state.docs.find(dd=>dd._id==d._id)!=null)
	)
	console.log('Actions LIVE update')
}

export async function compileActions(docs) {
	await sequential(docs.map(d => {
		return async function() {
			var code
			try {
				code = (await babel.transform(d.code, {
					minified: false,
					babelrc: false,
					presets: [
						["env", {
							"targets": {
								"node": "6.0"
							}
						}]
					]
				})).code;
				d.compiledCode = code;
				//await sander.writeFile(path.join(__dirname, `../actions/temp/_temp_${d.name}.js`), code);
			} catch (err) {
				console.error('Action', d.name, 'failed to load', err);
				d.hasErrors = true;
			}
		}
	}));
}

async function saveOrUpdateLocalActions(ApiAction) {
	//Save or update actions from src/actions
	let files = await sander.readdir(path.join(__dirname, '../actions'));
	files = files.filter(f => f.indexOf('js') !== -1);
	await sequential(files.map(f => {
		return async () => {
			let name = f.replace('.js', '');
			let code = (await sander.readFile(path.join(__dirname, '../actions/' + f))).toString('utf-8');
			let payload = {
				name,
				code,
				protected: true
			};
			let doc = await ApiAction.find({
				name: name
			});
			if (doc.length === 0) {
				await ApiAction.create(payload);
			} else {
				await ApiAction.update({
					name: name
				}, {
					$set: {
						code,
						protected: true
					}
				}).exec();
			}
		};
	})) //.catch(console.error);
}

function falseWithMessage(msg) {
	console.log(msg);
	return false;
}

export default {
	handler,
	sync
};