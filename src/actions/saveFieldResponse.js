export default async function(data) {
	const {
		db
	} = this;
	const FieldResponse = await db.conn().model('field_response');
	let doc = null;
	doc = FieldResponse.findOne({
		user: data.user,
		field: data.field
	}).exec();

	if (doc) {
		doc.value = data.value;
		await doc.save();
	} else {
		doc = await FieldResponse.create({
			user: data.user,
			field: data.field,
			value: data.value
		});
		db.conn().model('user').update({
			_id: data.userId
		}, {
			$push: {
				inputs: doc
			}
		}).exec();
	}
	return doc;
}