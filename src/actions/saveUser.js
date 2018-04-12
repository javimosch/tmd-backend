export const middlewares = [{
	name: 'authenticate',
	params: [{
		roleIs: 'root'
	}]
}, 'validateUserFields', 'transformPublicUser'];
export default async function(data) {
	const {
		encrypt
	} = this.modules.cryptr;
	const {
		_id,
		email,
		password,
		role
	} = data;
	let User = await this.model('user')
	let doc = null

	if (_id) {
		doc = await User.findOne({
			_id
		}).exec()
	}
	let payload = {};
	if (password) payload.password = encrypt(password)
	if (role) payload.role = role;
	if(!_id) payload.email = email
	if (payload) {
		if (doc) {
			doc.set(payload)
			this.modules.analytics.recordEvent('update_user',payload).catch(console.error);
			return await doc.save()
		} else {
			this.modules.analytics.recordEvent('create_user',payload).catch(console.error);
			return await User.create(payload)
		}
	}
	return doc;
}