import db from './db';
import * as sander from 'sander';
import sequential from 'promise-sequential';
import path from 'path';
import * as babel from 'babel-core';
const console = require('tracer').colorConsole();
const requireFromString = require('require-from-string', '', [
	process.cwd()
]);
var state = {
	docs: []
}
export default {
	sync,
	load,
	run,
	runPost,
	find
}

function find(m){
	return state.docs.find(d => d.name == m)
}

async function sync() {
	let ApiActionMiddleware = db.conn().model('api_action_middleware');
	let files = await sander.readdir(path.join(__dirname, '../middlewares'));
	files = files.filter(f => f.indexOf('js') !== -1);
	await sequential(files.map(f => {
		return async () => {
			let name = f.replace('.js', '');
			let code = (await sander.readFile(path.join(__dirname, '../middlewares/' + f))).toString('utf-8');
			var compiledCode
			var def;
			try {
				compiledCode = (await babel.transform(code, {
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
				def = requireFromString(compiledCode);
			} catch (err) {
				console.error('Middleware', name, 'failed to load', err)
				process.exit(1)
			}
			let payload = {
				compiledCode,
				name,
				code,
				protected: true
			};

			if (def.type) {
				payload.type = def.type
			}

			let doc = await ApiActionMiddleware.find({
				name: name
			});
			if (doc.length === 0) {
				await ApiActionMiddleware.create(payload);
			} else {
				await ApiActionMiddleware.update({
					name: name
				}, {
					$set: payload
				}).exec();
			}
		};
	}));
}

async function load() {
	let ApiActionMiddleware = db.conn().model('api_action_middleware');
	state.docs = await ApiActionMiddleware.find({})
}


async function run(doc, def, scope, data) {
	let middlewaresToRun = def.middlewares.map(n => find(typeof n==='object'?n.name:n)).filter(m => !!m && m.type==='pre');
	//console.info('Runing', doc.name, 'with middlewares', middlewaresToRun.map(m => m.name));
	await sequential(
		middlewaresToRun.map(m => {
			return async () => {
				let r = requireFromString(m.compiledCode).default.apply(scope, getMiddlewareParams(m,def.middlewares,data))
				if (r && r.then && r.catch) {
					return await r;
				} else {
					throw new Error('Middleware ' + m.name + ' should return a promise')
				}
			}
		})
	)
}

function getMiddlewareParams(middleware, middlewareList, data){
	let params = (data instanceof Array)?data:[data]
	let middlewareOptions = middlewareList.find(m=>typeof m==='object'&&m.name==middleware.name);
	//E.g: ['limitFields',['_id','text']]
	if(middlewareOptions){
		let middlewareParams = middlewareOptions.params;
		if(!(middlewareParams instanceof Array) && typeof middlewareParams === 'object'){
			middlewareParams = [];
		}
		params = params.concat(middlewareParams||[])
	}
	if(params.length>1){
		//console.warn('MIDDLEWARE PARAMS',middleware.name,'PARAMS',params,'COMPLETE LIST',middlewareList);
	}
	return params;
}

async function runPost(doc, def, scope, data) {
	if(!def.middlewares) return data;
	let middlewaresToRun = def.middlewares.map(n => {
		return find(typeof n==='object'?n.name:n)
	}).filter(m => !!m && m.type==='post');
	if(middlewaresToRun.length===0){
		//console.warn(doc.name,'has not post middlewares');
		return data;
	}
	console.info('Runing', doc.name, 'with middlewares (POST)', middlewaresToRun.map(m => m.name));

	let res = await sequential(
		middlewaresToRun.map(m => {
			return async (previousResponse,responses,count) => {
				//console.log('sequence',previousResponse,responses,count)
				if(count>1) {
					data = previousResponse;
				}
				console.log('Running',m.name,'with',data)
				let r = requireFromString(m.compiledCode).default.apply(scope, getMiddlewareParams(m,def.middlewares,data))
				if (r && r.then && r.catch) {
					return await r;
				} else {
					throw new Error('Middleware ' + m.name + ' should return a promise')
				}
			}
		})
	);
	console.log('After sequential',res)
	return res[res.length-1];
}