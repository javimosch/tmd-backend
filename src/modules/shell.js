import shelljs from 'shelljs'
const console = require('tracer').colorConsole();

export function exec(cmd, options = {}) {
	console.log('SHELL EXEC', cmd)
	return new Promise((resolve, reject) => {
		const silent = options.silent !== undefined ? options.silent : false
		var child = shelljs.exec(cmd, {
			async: true,
			cwd: options.cwd
		}, function(code, stdout, stderr) {
			if(code!==0){
				reject(new Error(stderr))
			}else{
				resolve(stdout)
			}
		});
		child.stdout.on('data', function(data) {
			if (options.onData) options.onData(data)
		});
		if(options.getChild){
			options.getChild(child)
		}
	})
}