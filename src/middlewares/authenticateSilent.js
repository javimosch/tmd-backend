export const type = 'pre'
export default async function authenticateSilent(data, options = {}) {
	let modelName = options&&options.model?options.model:'user';
	var user = null;
	var session = null;
	if (this.req.token == this.config.JWT_TOKEN && this.req.body.email) {
		//master access
		user = await this.model(modelName).findOne({
			email: this.req.body.email
		}).populate('sessions').exec()
		session = user.sessions[user.sessions.length - 1];
	} else {
		if (this.req.token) {
			//check jwt
			user = await this.modules.auth.getUserFromToken(this.req.token,modelName);
			if (user) {
				user = await user.populate('sessions').execPopulate()
				session = user.sessions[user.sessions.length - 1];
			} else {
				session = await this.modules.auth.getSessionFromToken(this.req.token,modelName);
			}

		}
	}

	if(session && !user){
		user = await this.model(modelName).findOne({
			sessions:{
				$in:[session._id]
			}
		}).exec();
	}

	this.req.session = session;
	this.req.user = user;
}