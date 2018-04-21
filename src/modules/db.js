const console = require('tracer').colorConsole();
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

var morgan = require('mongoose-morgan');

if (process.env.NODE_ENV !== 'production') {
	mongoose.set('debug', true);
}

const URI = process.env.dbURI || process.env.ME_CONFIG_MONGODB_URL;

var self = module.exports = {
	connections: {},
	connect: async (app) => {
		await loadModels();
		if (!URI) throw Error('dbURI required');
		await connectMongoose({
			name: 'default',
			models: null
		});
		//bindMorganLogging(app)
	},
	conn: () => self.connections.default,
	get: (n) => self.connections[n] || null,
	connectMongoose,
	URI: URI,
	closeConnectionSafely: (n) => {
		return new Promise((resolve, reject) => {
			try {
				if (self.get(n)) {
					if (self.get(n).readState !== 0) {
						self.get(n).close(false, () => {
							resolve();
						})
					}
				}
			} catch (err) {
				reject(err)
			}
		})
	}
}

function bindMorganLogging(app) {
	app.use(morgan({
			collection: 'morgan_logs',
			connectionString: URI,
		}, {
			skip: function(req, res) {
				return res.statusCode !== 500;
			}
		},
		'dev'
	));
}

function connectMongoose(options = {}) {
	const {
		name,
		models
	} = options
	return new Promise((resolve, reject) => {

		if (!name) return reject('NAME_REQUIRED')
		if (models) {
			console.log(`connectMongoose ${name} custom models`, models.map(m => m.name))
		}

		(async () => {
			var conn = mongoose.createConnection(URI, {
				server: {
					// sets how many times to try reconnecting
					reconnectTries: Number.MAX_VALUE,
					// sets the delay between every retry (milliseconds)
					reconnectInterval: 1000
				}
			});
			self.connections[name] = conn;

			if (!models) {
				Object.keys(mongoose.models).forEach(modelName => {
					conn.model(modelName, mongoose.models[modelName].schema);
				})
			} else {
				models.forEach(m => {
					conn.model(m.name, m.schema);
				})
			}

			conn.on('connected', () => {
				console.log('Connected');
				resolve();
			});
			conn.on('error', (err) => {
				console.error(err);
				reject();
			});
			conn.on('disconnected', () => {});
		})().catch(reject);
	});
}


function loadModels() {
	return new Promise((resolve, reject) => {
		fs.readdirSync(path.join(__dirname, '../models')).forEach(function(file) {
			var name = file.substr(0, file.indexOf('.'));
			try {
				require(path.join(__dirname, '../models', name));
				//console.log('Model ' + name + ' loaded');
			} catch (err) {
				reject('Model ' + name + ' failed to load: ' + err.toString());
			}
		});
		resolve();
	});
}