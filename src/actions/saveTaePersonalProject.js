import _ from 'lodash'
export const middlewares = ['authenticateSilent', 'sessionRequired']
export default async function(d) {
	d = _.pick(d, ['_id', 'name'])

	let payload = Object.assign(_.pick(d, ['name']), {
		user: this.req.user && this.req.user._id,
		session: this.req.session && this.req.session._id
	})

	if (!d._id) {
		return await this.model('tae_project').create(payload)
	} else {
		return await this.model('tae_project').findOneAndUpdate({
			_id: d._id
		}, payload, {
			upsert: true,
			new: true
		}).exec();
	}
}