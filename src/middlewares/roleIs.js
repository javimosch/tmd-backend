export const type = 'pre'
export default async function(data, roleName){
	const {req} = this;
	if(!req.user) throw new Error('authenticate first')
	if(!roleName) throw new Error('roleName required')
	return req.user && req.user.role == roleName
}