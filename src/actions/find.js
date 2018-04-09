import mongoose from 'mongoose';
export default async function(data) {
	const {
		db
	} = this;
	let Model = db.conn().model(data.model);
	let query = {};
	if (data.query) {
		query = data.query;
	}
	return (await Model.find(query).populate(data.populate || []).exec());
}