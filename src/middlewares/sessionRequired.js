export const type ='pre'
export default async function(){
	if(!this.req.session){
		throw new Error('SESSION_REQUIRED')
	}
}