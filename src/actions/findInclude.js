export default async function(data) {
	const {
		db
	} = this;
	let Model = db.conn().model(data.model);
	let query = {};
	if (data.value && data.fields) {
		let $or = [];
		data.fields.forEach(fieldName => {
			let $orItem = {};
			$orItem[fieldName] = {
				$regex: new RegExp(data.value),
				$options: 'i'
			};
			$or.push($orItem);
		});
		query.$or = $or;
	}
	return (await Model.find(query).exec()).map(d => {
		let json = {};
		try {
			json = JSON.parse(d.code);
		} catch (err) {}
		return {
			text: d.name,
			value: d._id,
			group: json.group || ''
		};
	});
}