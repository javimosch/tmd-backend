import moment from 'moment'
var generate = require('project-name-generator');
import {
	configureLoggingSockets
} from './logging'
import db from './db'
const console = require('tracer').colorConsole();
var io;

export function emit(n, d) {
	if (io) {
		var nspName = d.$nsp;
		delete d.$nsp;
		if (nspName) {
			io.of(nspName).emit(n, d);
		} else {
			io.emit(n, d);
		}
	}
}


export function getInstance() {
	if (!io) return null;
	io.state = io.state || {
		scopes: io.state && io.state.scopes || [],
		_events: io.state && io.state._events || {},
		events: io.state && io.state.events || {
			emit: function ioEventsEmit(n, d) {
				if (!io.state._events[n]) return;
				console.info('IO-EVENT-EMIT', n)
				io.state._events[n].forEach(h => h(d));
			},
			on: function ioEventsOn(n, h) {
				io.state._events[n] = io.state._events[n] || [];
				io.state._events[n].push(h);
			}
		}
	};
	return io;
}

export function emitEvent(n, d) {
	if (io && io.state && io.state.events) {
		io.state.events.emit(n, d);
	}
}

export default function(app) {
	io = require('socket.io')(app);

	configureLoggingSockets(io)

	io.on('connection', function(socket) {
		//console.log('NEW SOCKET',socket);

	});

	var nsp = io.of('worker')
	nsp.on('connect', (socket) => {
		socket.on('logWorkerCrash', p => console.error('WORKER_CRASH', p))
		socket.on('logWorkerManagerError', p => console.error('WORKER_MANAGER_ERROR', p))
	})

	var nspWorkerLogger = io.of('workerLogger')
	nspWorkerLogger.on('connect', (socket) => {
		socket.on('workerStdout', p => {
			if (p.project) {
				let payload = p.line
				try {
					payload = JSON.parse(p.line)
					payload.at = moment().format('DD/MM/YYYY HH:mm:ss SSS')
				} catch (err) {
					console.error(err)
				}
				io.of(p.project + '_logs').emit('line', payload)
			}
			console.warn('WORKER', p.project || '(unidentified)', p.line)
		})
	})

	console.log('NSPS_PROJECT_CONFIGURING')
	configureProjectNamespace(io).catch(err => {
		throw err
	})


}

async function configureProjectNamespace(io) {
	let projects = await db.conn().model('wra_project').find({}).select('serverKey name').exec();
	projects.forEach(p => {
		let nsp = io.of(p._id)
		nsp.on('connect', socket => {

			console.log('Worker connect to project socket')

			socket.on('initialSync', params => {
				workerInitialSync(socket, params).catch(console.error)
			})


			socket.on('resources', params => {
				console.log('NSP_PROJECT_SOCKET_ON_RESOURCES',params)
				io.of(p._id + '_resources').emit('item', params)
			})
		})

		console.log('NSP_PROJECT_RESOURCES_CONFIGURED',p._id,p.name)
		io.of(p._id + '_resources').on('connect',socket=>{
			console.log('NSP_PROJECT_RESOURCES_SOCKET_CONNECTED')
			socket.on('refresh', ()=>{
				console.log('NSP_PROJECT_RESOURCES_SOCKET_ON_REFRESH')
				nsp.emit('resources',{})
			})
		})
	})
}

async function workerInitialSync(socket, params) {
	if (!params.project) {
		return console.error('Worker initialSync project missing')
	}
	if (!params.serverKey) {
		return console.error('Worker initialSync serverKey missing')
	}
	let Project = await db.conn().model('wra_project')
	let Action = await db.conn().model('wra_action')
	let Worker = await db.conn().model('wra_worker')

	let p = await Project.findOne({
		//name:/wrap/
		_id: params.project,
		serverKey: params.serverKey
	}).select('name owner').exec();

	if (!p) {
		return console.error('WORKER_INITIAL_SYNC_PROJECT_MISMATCH', {
			project: params.project,
			serverKey: params.serverKey
		})
	}

	let workerData = {
		project: p._id,
		user: p.owner
	};
	let w = await Worker.findOne(workerData).exec();

	if (!w) {
		w = await Worker.create(Object.assign(workerData, {
			name: generate({
				number: true
			}).dashed
		}))
	}
	w.lastConnection = Date.now()
	await w.save()

	let functions = await Action.find({
		project: p._id
	}).select('name code').exec();

	functions.forEach(f => {
		socket.emit('sync', {
			t: 'function',
			n: f.name,
			c: f.code
		})
	})



}