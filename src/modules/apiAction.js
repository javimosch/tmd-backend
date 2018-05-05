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
import moment from 'moment';
import {
	execute as executeActionWithWorker
} from './worker'

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


let m = null
async function getModules() {
	if (m) return m;
	if (_.keys(state.modules).length > 0) return state.modules;
	let dirs = await sander.readdir(path.join(__dirname))
	//d.indexOf('apiAction.js') === -1 &&
	let res = await sequential(dirs.filter(d => d.indexOf('.js') !== -1).map(d => {
		return async () => ({
			name: d.replace('.js', ''),
			def: require('./' + d)
		})
	}))
	res.forEach(r => state.modules[r.name] = r.def)
	m = state.modules;;
	return m;
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
	if (!err) {
		err = new Error('UNDEFINED_ERROR')
	}
	if (!err.messag && !err.stack) {
		err = new Error(JSON.stringify({
			message: "UNKNOWN_ERROR",
			details: err
		}, null, 2))
	}
	console.error('SERVER ERROR', err.message, err.stack)
	let errObject = errToJSON(err);
	if (process.env.ERRORS_RES_MODE === 'message') {
		errObject = {
			message: errObject.message,
			stack: errObject.stack
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

export function handleClient() {
	return function rpcClientMiddleware(req, res) {
		(async () => {
			let payload = req.body;
			let apiKey = req.params.client;

			const WraAction = db.conn().model('wra_action')
			const WraProject = db.conn().model('wra_project')

			if (!payload.n) return sendBadParam('404', res)
			if (!payload.d) return sendBadParam('404', res)

			let actionScope = await getActionScope(req)


			await middlewares.run({
				name: payload.n
			}, {
				middlewares: [{
					name: 'authenticateSilent',
					params: [{
						model: 'tae_user'
					}]
				}]
			}, actionScope, payload.d)



			var actionQueryPayload = {
				name: payload.n
			};

			if (req.user) {

				if (!payload.d.$project) {
					throw new Error('PROJECT_REQUIRED')
				}

				if (req.user.role === 'normal') {
					actionQueryPayload.owner = req.user._id
					actionQueryPayload.project = payload.d.$project
				} else {
					actionQueryPayload.project = payload.d.$project
				}
			} else {
				let project = await WraProject.findOne({
					apiKey
				}).select('_id').exec()
				if (!project) {
					throw new Error('INVALID_API_KEY')
				} else {
					actionQueryPayload.project = project._id
				}
			}

			let action = await WraAction.findOne(actionQueryPayload).exec();


			if (!action) return sendServerError(new Error('ACTION_MISMATCH'), res)

			/*
			if (!action.compiledAt || action.updatedAt > action.compiledAt) {
				await compileActions([action]);
			}
			var def
			try {
				def = requireFromString(action.compiledCode);
			} catch (err) {
				throw new Error(JSON.stringify({
					message: "ACTION_COMPILATION_FAIL",
					detail: errToJSON(err)
				}, null, 2))
			}
			let actionPromise = def.default.apply({}, [payload.d])
			if (!actionPromise.then) return sendBadParam('ACTION_PROMISE_REQUIRED', res)
				*/

			//let result = await actionPromise
			let result = await executeActionWithWorker(action, payload.d)

			sendSuccess(result, res)
		})().catch(err => sendServerError(err, res))
	}
}

export function handler() {
	return async function rpcMiddleware(req, res) {
		let payload = req.body;

		if (!payload.n) return sendBadParam('Action name required (n)', res);
		if (!payload.d) return sendBadParam('Action data required (d)', res);

		if (typeof payload.d !== 'object') {
			try {
				payload.d = JSON.parse(payload.d)
			} catch (err) {
				return sendBadParam('Action data type mismatch (object expected)', res);
			}
		}

		//multipart data key support
		var multipartData = {}
		for (var x in payload) {
			if (x.indexOf('d.') !== -1) {
				multipartData[x.replace('d.', '')] = payload[x]
			}
		}
		if (Object.keys(multipartData).length > 0) {
			payload.d = Object.assign({}, multipartData, payload.d)
		}

		let doc = null; //state.docs.filter(d => d.name == payload.n)[0];

		if (!doc) {
			doc = await db.conn().model('api_action').findOne({
				name: payload.n
			}).exec();
		}

		var fd = (d) => moment(d).format('DD/MM/YYYY HH:mm')
		if (!doc) return sendBadParam('Action mistmach: ' + payload.n, res);

		console.info(`Action ${payload.n} should compile? ${fd(doc.updatedAt)}>${fd(doc.compiledAt)}`)

		if (!doc.compiledAt) {
			await compileActions([doc]);
		} else {
			if (doc.updatedAt > doc.compiledAt) {
				await compileActions([doc]);
			}
		}
		if (!doc.compiledCode) {
			await compileActions([doc]);
		}

		if (!doc.compiledCode) return sendServerError(doc.err || new Error('FUNCTION_COMPILE_ERROR'), res)

		var def
		try {
			def = requireFromString(doc.compiledCode);
		} catch (err) {
			console.error(err.stack)
			return sendServerError(new Error('FUNCTION_REQUIRE_ERROR'), res)
		}

		const functionScope = await getActionScope(req)

		//middlewares
		if (def.middlewares) {
			try {
				await middlewares.run(doc, def, functionScope, payload.d);
			} catch (err) {
				//console.warn('Action', doc.name, 'middleware exit')
				return sendServerError(err, res);
			}
		} else {
			//console.info('Runing', doc.name, 'without middlewares')
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

async function getActionScope(req) {
	var scope = {
		requireFromString,
		errToJSON,
		babel,
		_,
		lodash: _,
		model: (n) => db.conn().model(n),
		db,
		sequential,
		req: req,
		config,
		modules: await getModules(),
		call: function(n, p) {
			return call.apply({}, [n, getArgumentsShifted(arguments, 1), req])
		},
		callAction: function(n, p) {
			return call.apply({}, [n, getArgumentsShifted(arguments, 1), req])
		}
	};
	console.trace('getActionScope', !!scope.req, Object.keys(scope))
	return scope;
}

function getArgumentsShifted(args, positions) {
	let result = Array.prototype.slice.call(args)
	for (var x = 0; x < positions; x++) {
		result.shift()
	}
	return result;
}

export async function call(name, params, req) {
	if (!(params instanceof Array)) throw new Error('call params should be Array')
	if (!req) throw new Error('Express Request (req) expected')
	var doc = await db.conn().model('api_action').findOne({
		name: name
	}).exec();
	if (!doc) throw new Error('Action mistmach: ' + name);
	if (!doc.compiledAt || doc.updatedAt > doc.compiledAt) {
		await compileActions([doc]);
		console.log(`SubCall Action ${name} compiled`)
	}
	let def = requireFromString(doc.compiledCode);
	const scope = await getActionScope(req);
	if (def.middlewares) await middlewaresRunPre(doc, def, scope, params)
	console.log(`SubCall ${name} Params: ${Object.keys(params[0]).map(p=>`(${p}, ${typeof params[0][p]})`).join(', ')} ${params.length}`)
	let p = def.default.apply(scope, params)
	if (p && p.then && p.catch) {
		let response = await p;
		response = await middlewares.runPost(doc, def, scope, response)
		console.info(`SubCall ${name} success`, response)
		return response
	} else {
		throw new Error('Action should return a promise');
	}
}

async function middlewaresRunPre(doc, def, scope, params) {
	try {
		await middlewares.run(doc, def, scope, params);
	} catch (err) {
		console.warn('Action', doc.name, 'middleware exit')
		throw err
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
		console.error(err.stack)
		console.error('It should be able to read modules')
		process.exit(1);
	}


	if (!IS_PRODUCTION) {
		//await middlewares.sync()
		//await saveOrUpdateLocalActions(ApiAction);
	}

	await middlewares.load()

	/*
	state.docs = await ApiAction.find({}).exec();
	state.docs = state.docs.filter(d => {
		if (d.name.indexOf(' ') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		if (d.name.indexOf('$') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		if (d.name.indexOf('-') !== -1) return falseWithMessage('Action skip: [' + d.name + ']');
		return true;
	});
	await compileActions(state.docs);
	state.docs = state.docs.filter(d => !d.hasErrors);
	*/

	return;
}

export async function updateActions(docs) {
	console.log('Compiling actions', docs.map(d => d.name))
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
		docs.filter(d => state.docs.find(dd => dd._id == d._id) == null)
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
					sourceMaps: 'inline',
					presets: [
						["env", {
							"targets": {
								"node": "6.0"
							}
						}]
					]
				})).code;
				d.compiledCode = code;
				d.compiledAt = Date.now()
				await d.save()
				//await sander.writeFile(path.join(__dirname, `../actions/temp/_temp_${d.name}.js`), code);
			} catch (err) {
				console.error('Action', d.name, 'failed to load', err);
				d.err = err;
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
	handleClient,
	sync
};