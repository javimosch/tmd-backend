export default async function(data) {
	const {
		db
	} = this;
	let Model = db.conn().model(data.model);
	if (!data.query) data.query = {};
	if (!data.offset) data.offset = 0;
	if (!data.limit) data.limit = 500;
	if (!data.options) data.options = {};

	if(data.populate){
		data.options.populate = data.populate;
	}

	let res = await Model.findPaginate(data.query, data.offset, data.limit,data.options||{});
	let arr = res.docs;
	return arr.map(d => {
		d = d.toJSON();
		if (data.select) {
			let dd = {};
			data.select.forEach(k => dd[k] = d[k]);
			d = dd;
		}
		if (data.extractFromJsonField) {
			try {
				const params = data.extractFromJsonField;
				const fieldName = params[0];
				const keys = params[1];
				const json = JSON.parse(d[fieldName]);
				keys.forEach(key=>{
					d[key] = json[key];
				});
			} catch (err) {
				console.error(err);
			}
		}
		if (data.transform) {
			let dd = {};
			data.transform.forEach(t => {
				let s = t.split(':');
				dd[s[1]] = d[s[0]];
			});
			Object.assign(d,dd);
		}
		return d;
	});
}