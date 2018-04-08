export default async function(data) {
	const {
		db
	} = this;
	let Model = db.conn().model('field');
	let doc = null;
	if (data._id) {
		doc = await Model.findById(data._id).exec();
	}
	delete data._id;

	if (data.code) {
		try {
			let json = JSON.parse(data.code)
			data.group = json.group;
		} catch (err) {
			throw new Error('Invalid JSON');
		}
	}

	if (!doc) {
		doc = await Model.create(data);
	} else {
		doc.set(data);
		await doc.save();
	}
	return doc;
}