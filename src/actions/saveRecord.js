export default async function saveRecord(data) {
	const {
		db
	} = this;
	let Model = db.conn().model(data.model);
	let doc = null;
	if (data._id) {
		doc = await Model.findById(data._id).exec();
	}
	delete data._id;
	delete data.model;
	if (!doc) {
		doc = await Model.create(data);
	} else {
		doc.set(data);
		await doc.save();
	}
	return doc;
}