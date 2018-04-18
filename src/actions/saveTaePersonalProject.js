import _ from 'lodash'
export const middlewares = [{
	name:'authenticateSilent',
	params:[{
		model:'tae_user'
	}]
}, 'sessionRequired']
export default async function(d) {
	d = _.pick(d, ['_id', 'name'])

	let payload = Object.assign(_.pick(d, ['name']), {
		user: this.req.user && this.req.user._id,
		session: this.req.session && this.req.session._id
	})

	if (!d._id) {
		this.modules.analytics.recordEvent('et_create_project',payload).catch(console.error);
		return await this.model('tae_project').create(payload)
	} else {
		this.modules.analytics.recordEvent('et_update_project',payload).catch(console.error);
		return await this.model('tae_project').findOneAndUpdate({
			_id: d._id
		}, payload, {
			upsert: true,
			new: true
		}).exec();
	}
}