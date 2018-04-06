const console = require('tracer').colorConsole();
import db from './db';
import * as sander from 'sander';
import sequential from 'promise-sequential';
import path from 'path';
import * as babel from 'babel-core';

var requireFromString = require('require-from-string');

let state = {
	docs: []
};

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

function sendServerError(res) {
	res.status(500).json({
		data: null,
		err: 'Server error',
	});
}

export function handler() {
	return function(req, res) {
		let payload = req.body;

		if (!payload.n) return sendBadParam('Action name required (n)', res);
		if (!payload.d) return sendBadParam('Action data required (d)', res);
		if (typeof payload.d !== 'object') return sendBadParam('Action data type mismatch (object expected)', res);


		console.log(state.docs[0].name, payload.n);
		let doc = state.docs.filter(d => d.name == payload.n)[0];

		if (!doc) return sendBadParam('Action mistmach: ' + payload.n, res);

		let def = requireFromString(doc.compiledCode);

		let p = def.default(payload.d);
		if (p && p.then && p.catch) {
			(async () => {
				let actionResponseData = await p;
				sendSuccess(actionResponseData, res);
			})().catch(err => {
				console.log(err);
				sendServerError(res)
			});

		} else {
			return sendBadActionImplementation('Action should return a promise', res);
		}


	}
}

export async function syncActions() {
	await sander.rimraf(path.join(__dirname, '../actions/*.js'));
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
	state.docs = await ApiAction.find({}).exec();
	state.docs = state.docs.filter(d=>{
		if(d.name.indexOf(' ')!==-1) return falseWithMessage('Action skip: ['+d.name+']');
		if(d.name.indexOf('$')!==-1) return falseWithMessage('Action skip: ['+d.name+']');
		if(d.name.indexOf('-')!==-1) return falseWithMessage('Action skip: ['+d.name+']');
		return true;
	});
	await sequential(state.docs.map(d => {
		return async function() {
			let code = (await babel.transform(d.code, {
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
			await sander.writeFile(path.join(__dirname, `../actions/${d.name}.js`), code);
		}
	}));
	return;
}

function falseWithMessage(msg){
	console.log(msg);
	return false;
}

export default {
	handler,
	syncActions
};