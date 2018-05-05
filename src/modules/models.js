import db from './db';
import mongoose from 'mongoose';
import * as babel from 'babel-core';
const requireFromString = require('require-from-string', '', [
	process.cwd(),
	__dirname
]);
const console = require('tracer').colorConsole();

export async function load() {
	try {
		let docs = await db.conn().model('wra_model').find({}).exec()
		docs.forEach(async (doc) => {
			try {
				let module = requireFromString(await compileToES5(doc.code))
				let scope = getModelHandlerScope()
				console.log(Object.keys(scope))
				let model = await module.default.apply(scope, [])
				db.conn().model(doc.name, model.schema)
				console.log('loaded', doc.name)
			} catch (err) {
				console.warn('unable to load', doc.name, err.stack)
			}
		})
	} catch (err) {
		console.error('Unable to list models', err.stack)
	}
}

function getModelHandlerScope() {
	return {
		plugins: {
			pagination: {
				configure: require('../helpers/mongoPagination').configure
			}
		}
	}
}

async function compileToES5(code) {
	return (await babel.transform(code, {
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
}