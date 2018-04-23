import shelljs from 'shelljs'
const console = require('tracer').colorConsole();

export function exec(cmd, options = {}) {
	console.log('SHELL EXEC', cmd)
	return new Promise((resolve, reject) => {
		const silent = options.silent !== undefined ? options.silent : false
		var child = shelljs.exec(cmd, {
			silent,
			async: true,
			cwd: options.cwd,
			env:options.env
		}, function(code, stdout, stderr) {
			if (code !== 0 && silent) {
				console.error('SHELL CHILD EXIT ERROR', stderr);
			} else {
				if (!options.returnChild) {
					if (code !== 0) {
						reject(new Error(stderr))
					} else {
						resolve(stdout)
					}
				}
			}
		});
		child.stdout.on('data', function(data) {
			if (options.onData) options.onData(data)
		});
		if (options.returnChild) {
			return resolve(child)
		}
	})
}