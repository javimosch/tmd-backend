import _ from 'lodash'

export const middlewares = ['authenticateSilent']

export default async function(d) {
	let hash = d.hash
	if (!hash) throw new Error('FINGERPRINT_REQUIRED')
	let session = await this.model('session').findOne({
		hash: hash
	}).exec()
	if (session) {
		session.metadata = d.metadata || session.metadata
		session.count++;
		session.authAt.push(d.at || new Date())
		session = await session.save();
	} else {
		session = await this.model('session').create({
			hash: hash,
			metadata: d.metadata
		})
	}
	if (this.req.user) {
		if (!this.req.user.sessions.find(s => s == s.hash == session.hash)) {
			this.req.user.sessions.push(session._id)
			await this.req.user.save();
		}
	}
	return {
		token: this.modules.auth.jwtSign({
			sessionId: session._id
		}),
		session: _.pick(session, ['_id', 'hash', 'metadata'])
	};
}