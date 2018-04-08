export default async function(data){
	const {db} = this;
	let Model = db.conn().model(data.model);
	let query = {};
	if(data._id){
		query = {
			_id:data._id
		}
	}else{
		if(data.query){
			query = data.query;
		}else{
			throw new Error('query or _id required');
		}
	}
	return (await Model.remove(query).exec());
}