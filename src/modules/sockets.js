const console = require('tracer').colorConsole();
var io;

export function emit(n, d) {
	if (io) {
		console.log('Sockets: Emit', n, d);
		io.emit(n, d);
	}
}

export function getInstance() {
	io.state = io.state || {}
	io.state = {
		scopes: io.state.scopes || [],
		_events: io.state._events||{},
		events: io.state.events||{
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

	io.on('connection', function(socket) {
		socket.emit('news', {
			hello: 'world'
		});
		socket.on('my other event', function(data) {
			console.log(data);
		});
	});
}