import _ from 'lodash'
export const type = 'post'
export default async function(data){
	if(data && data.token){
		data.user = _.pick(data.user,['email','role'])
	}
	return data
}