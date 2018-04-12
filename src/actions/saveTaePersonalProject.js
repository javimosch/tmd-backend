import _ from 'lodash'
export const middlewares = ['authenticateSilent', 'sessionRequired']
export default async function(d) {
	d = _.pick(d,['_id','name'])
	return await this.model('tae_project').findOneAndUpdate({
		_id: d._id
	}, Object.assign(d, {
		user: this.req.user && this.req.user._id,
		session: this.req.session && this.req.session._id
	}), {
		upsert: true,
		new: true
	}).exec();
}