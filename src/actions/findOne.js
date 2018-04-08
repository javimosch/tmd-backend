import mongoose from 'mongoose';
export default async function(data){
	const {db} = this;
	let Model = db.conn().model(data.model);
	let query = {};
	if(data._id && mongoose.Types.ObjectId.isValid(data._id)){
		query = {
			_id:data._id
		}
	}else{
		if(data.query){
			query = data.query;
		}else{
			//no {} searchs
			return null;
		}
	}
	return (await Model.findOne(query).exec());
}