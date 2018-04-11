import {
	encrypt
} from './src/modules/cryptr'
export const middlewares = [{
	name: 'authenticate',
	params: [{
		roleIs: 'root'
	}]
}, 'validateUserFields', 'transformPublicUser'];
export default async function(data) {
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
			return await doc.save()
		} else {
			return await User.create(payload)
		}
	}
	return doc;
}