export default async function(){
	const {db} = this;
	let ApiAction = db.conn().model('api_action');
	return (await ApiAction.find({}).exec()).map(d=>{
		return {
			text: d.name,
			value:d._id
		};
	});
}