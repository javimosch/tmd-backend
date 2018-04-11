export const type = 'pre'
export default async function(data,options = {}){
	var user;
	if(this.req.token == this.config.JWT_TOKEN && this.req.body.email){
		//master access
		user = await this.model('user').findOne({email:this.req.body.email}).exec()
		if(!user){
			throw new Error('Email mismach')
		}
	}else{
		if(this.req.token){
			//check jwt
			user = await this.modules.auth.getUserFromToken(this.req.token);
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