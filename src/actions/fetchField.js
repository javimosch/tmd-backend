export default async function(data){
	const {db} = this;
	let Model = db.conn().model('field');
	let query = {};
	if(data._id){
		query = {
			_id:data._id
		}
	}else{
		query = data;
	}
	return (await Model.findOne(query).exec());
}