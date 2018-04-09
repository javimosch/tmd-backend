export default async function(data) {
	const {
		db,
		sequential
	} = this;
	const Field = db.conn().model('field');
	const FieldGroup = db.conn().model('field_group');

	let ops = data.fields.map((f, index) => {
		return async () => {
			return await Field.update({
				_id: f._id
			}, {
				$set: {
					order: index
				}
			}).exec();
		}
	});

	ops.unshift(async()=>{
		let f = data.fields[0];
		let fg = await FieldGroup.findById(f.group._id||f.group).exec();
		if(!fg) throw new Error(`Field group ${f.group._id||f.group} not found`);
		fg.fields = data.fields.map(f=>f._id);
		return await fg.save();
	});

	return await sequential(ops)
}