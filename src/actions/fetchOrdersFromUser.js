import mongoose from 'mongoose';
export default async function(data){
	const {db} = this;
	let Model = db.conn().model('order');
	return await Model.fromUser(data._id,data.options||{});
}