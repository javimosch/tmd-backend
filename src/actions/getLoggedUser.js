export const middlewares = [{
	name:'authenticate',
	params:[{
		model:"tae_user"
	}]
}];
export default async function(data){
	return this.req.user;
}