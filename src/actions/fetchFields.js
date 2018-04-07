export default async function(){
	const {db} = this;
	let Model = db.conn().model('field');
	return (await Model.find({}).exec()).map(d=>{
		return {
			text: d.name,
			value:d._id
		};
	});
}