export const middlewares = [ {
	name:'authenticateSilent',
	params:{
		model:"tae_user"
	}}]
export default async function taeGetPersonalProjects(){
	let res = [];
	if(this.req.user){
		return await this.model('tae_project').find({
			user:this.req.user
		})
	}
	if(this.req.session){
		return await this.model('tae_project').find({
			session:this.req.session
		})	
	}

	if(!this.req.session&&!this.req.user){
		throw new Error('SESSION_REQUIRED')
	}else{
		if(res.length===0){
			let doc = await this.model('tae_project').create({
				name:"my-first-project",
				user:this.req.user&&this.req.user._id,
				session:this.req.session&&this.req.session._id
			})
			res = [doc]
		}
	}
	
	return res;
}