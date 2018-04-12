export const type = 'pre'
export default async function authenticate(data,options = {}){
	let modelName = options&&options.model?options.model:'user';
	var user;
	if(this.req.token == this.config.JWT_TOKEN && this.req.body.email){
		//master access
		user = await this.model(modelName).findOne({email:this.req.body.email}).populate('sessions').exec()
		if(!user){
			throw new Error('Email mismach')
		}
	}else{
		if(this.req.token){
			//check jwt
			user = await this.modules.auth.getUserFromToken(this.req.token,modelName);
			if(user){
			user = await user.populate('sessions').execPopulate()
		}
			if(!user){
				throw new Error('LOGIN_REQUIRED')
			}
		}else{
			throw new Error('LOGIN_REQUIRED')
		}
	}
	if(options && options.roleIs && user.role !== options.roleIs){
		throw new Error('UNAUTHORIZED')
	}
	this.req.user = user;
}