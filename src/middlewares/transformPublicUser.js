import _ from 'lodash'

export const type = 'post';
export default async function(user) {
	if(user){
		user = _.pick(user,['email'])
	}
	return user;
}