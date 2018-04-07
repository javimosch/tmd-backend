export default async function(data){
	const {db} = this;
	let Model = db.conn().model('field');
	return (await Model.findOne({
		_id: data._id
	}).exec());
}