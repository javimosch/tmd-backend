import _ from 'lodash'
export const type = "post"
export default async function(data) {
	if(data){
		if(data.toJSON) data = data.toJSON()
		return _.omit(data,['password'])
	}
	return data;
}