import _ from 'lodash'
export const middlewares = ['taeSendErrorValidate']

export default async function(d) {
	let doc = null
	if (d.stack && d.message && d.pid) {
		let c = await this.model('tae_project').count({
			_id: d.pid
		}).exec();
		if (c === 0) return;
		doc = await this.model('tae_error').findOne({
			project: d.pid,
			message: d.message,
			stack: d.stack
		}).exec()
		if (doc) {
			console.log(doc)
			doc.count++
				doc.dates.push(d.at || new Date())
			await doc.save()
		} else {
			doc = await this.model('tae_error').create({
				project: d.pid,
				message: d.message,
				stack: d.stack,
				dates: [
					d.at || new Date()
				],
				metadata: _.omit(d, ['message', 'stack'])
			});
		}
	} else {
		doc = await this.model('tae_error').create({
			project: d.pid,
			message: d.message,
			stack: d.stack || '',
			dates: [
				d.at || new Date()
			],
			metadata: _.omit(d, ['message', 'stack'])
		});
	}
	this.modules.sockets.emitEvent('taeSendError:'+doc.project, doc.toJSON())
}