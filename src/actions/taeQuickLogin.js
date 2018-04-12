export const middlewares = ['validateLoginFields', 'transformLogin', {
	name: 'authenticateSilent',
	params: {
		model: "tae_user"
	}
}];
export default async function({
	email,
	password
}) {
	const {
		encrypt
	} = this.modules.cryptr;
	const {
		model
	} = this;
	let doc = await model('tae_user').findOne({
		email,
		password: encrypt(password)
	});
	let userExists = (await model('tae_user').count({
		email
	}).exec()) !== 0;

	if (!userExists && !doc){
		doc = await model('tae_user').create({
			email,
			password: encrypt(password)
		});
	}

	if (userExists && !doc) {
		throw new Error('PASSWORD_MISMATCH')
	}


	if (!doc.sessions || (this.req.session && doc.sessions.find(s => s._id == this.req.session) == null)) {
		if (!doc.sessions) doc.sessions = [];
		doc.sessions.push(this.req.session);
		await doc.save();
	}

	if (this.req.session) {
		let arr = await this.model('tae_project').find({
			session: this.req.session._id
		}).exec();
		if (arr.length > 0) {
			await this.model('tae_project').update({
				_id: {
					$in: arr.map(d => d._id)
				}
			}, {
				$set: {
					user: doc._id
				}
			}).exec();
		}
	}


	return {
		user: doc,
		token: jwtSign({
			userId: doc._id
		})
	};

}