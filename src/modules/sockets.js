const console = require('tracer').colorConsole();
var io;

export function emit(n,d){
	if(io){
		console.log('Sockets: Emit',n,d);
		io.emit(n,d);
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