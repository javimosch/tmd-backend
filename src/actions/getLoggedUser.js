export const middlewares = [{
	name:'authenticate',
	params:[]
}];
export default async function(data){
	return this.req.user;
}