import {configureLoggingSockets} from './logging'

const console = require('tracer').colorConsole();
var io;

export function emit(n, d) {
	if (io) {
		var nspName = d.$nsp;
		delete d.$nsp;
		if(nspName){
			io.of(nspName).emit(n,d);
		}else{
			io.emit(n, d);	
		}
	}
}


export function getInstance() {
	if(!io)return null;
	io.state = io.state || {
		scopes: io.state&&io.state.scopes || [],
		_events:io.state&& io.state._events||{},
		events: io.state&&io.state.events||{
			emit: function ioEventsEmit(n, d){
				if (!io.state._events[n]) return;
				console.info('IO-EVENT-EMIT',n)
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

export function emitEvent(n,d){
	if(io && io.state && io.state.events){
		io.state.events.emit(n,d);
	}
}

export default function(app) {
	io = require('socket.io')(app);

	configureLoggingSockets(io)

	io.on('connection', function(socket) {
		socket.emit('news', {
			hello: 'world'
		});
		socket.on('my other event', function(data) {
			console.log(data);
		});
	});
}