import {
	emit as emitSocketIOEvent
} from './sockets'
var capcon = require('capture-console');

var outputStdout = '';
var outputStderr = '';

export function getData() {
	return {
		stderr: outputStderr,
		stdout: outputStdout
	}
}

export function configureLoggingSockets(io) {
	let nsp = io.of('logging')
	nsp.on('connect', socket => {
		console.log('LOGGING SOCKET CONNECTED')
		socket.on('fetchAll', () => {
			console.log('SOCKET fetchAll REQUESTED')
			socket.emit('logging', {
				stdout: outputStdout,
				stderr: outputStderr
			})
		})
	})
}

capcon.startCapture(process.stdout, function(stdout) {
	if (outputStdout.length > 2097152) outputStdout = '';

	outputStdout += outputStdout;

	emitSocketIOEvent('logging', {
		$nsp: 'logging',
		stdout: stdout,
		stderr: ''
	});


});

capcon.startCapture(process.stderr, function(stderr) {
	if (outputStderr.length > 2097152) outputStderr = '';
	outputStderr += stderr
	emitSocketIOEvent('logging', {
		$nsp: 'logging',
		stdout: '',
		stderr: stderr
	});


});