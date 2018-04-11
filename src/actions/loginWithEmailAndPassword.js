import {jwtSign} from './src/modules/auth'
import {encrypt} from './src/modules/cryptr'
export const middlewares = ['validateLoginFields','transformLogin'];
export default async function({email, password}) {
	const {
		model
	} = this;
	let doc = await model('user').findOne({
		email, 
		password: encrypt(password)
	});
	if (doc) {
		return {
			user: doc,
			token: jwtSign({
				userId: doc._id
			})
		};
	}else{
		return null;
	}
}