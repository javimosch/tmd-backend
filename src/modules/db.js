const console = require('tracer').colorConsole();
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
if (process.env.NODE_ENV !== 'production') {
	mongoose.set('debug', true);
}

const URI = process.env.dbURI || process.env.ME_CONFIG_MONGODB_URL;

var self = module.exports = {
	connections: {},
	connect: async () => {
		console.log('Loading models');
		await loadModels();
		if (!URI) throw Error('dbURI required');
		console.log('Loading mongoose connection');
		await connectMongoose();
	},
	conn:()=> self.connections.default
}

function connectMongoose() {
	return new Promise((resolve, reject) => {
		var conn = mongoose.createConnection(URI);
		conn.on('connected', () => {
			console.log('Connected');
			resolve();
		});
		conn.on('error', (err) => {
			console.error(err);
			reject();
		});
		conn.on('disconnected', () => {});
		self.connections.default = conn;
	});
}


function loadModels() {
	return new Promise((resolve, reject) => {
		fs.readdirSync(path.join(__dirname, '../models')).forEach(function(file) {
			var name = file.substr(0, file.indexOf('.'));
			try {
				require(path.join(__dirname, '../models', name));
				console.log('Model ' + name + ' loaded');
			} catch (err) {
				reject('Model ' + name + ' failed to load: ' + err.toString());
			}
		});
		resolve();
	});
}