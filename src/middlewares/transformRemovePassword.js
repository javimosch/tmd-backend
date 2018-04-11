import _ from 'lodash'
export const type = "post"
export default async function(data) {
	if(data.toJSON) data = data.toJSON()
	if(data){
		return _.omit(data,['password'])
	}
	return data;
}