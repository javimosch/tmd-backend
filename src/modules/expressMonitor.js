import {emit} from './sockets';

export default async function(app) {
	var responseTime = require('response-time')

	app.use(responseTime(function(req, res, time) {
		console.log('ELAPSED', req.body, parseInt(time), 'ms')
		if (req.body && req.body.n) {
			emit('point', {
				name: req.body.n,
				d: parseInt(time),
				type:req.method
			});
		}
	}))

}