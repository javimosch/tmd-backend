export const middlewares = [{
	name:'authenticate',
	params:[{
		roleIs:'root'
	}]
}];
export default async function(data){
	const {db} = this;
	let Model = db.conn().model('field');
	let query = {};
	if(data._id){
		query = {
			_id:data._id
		};
	}else{
		query = data;
	}
	console.log('QUERY', query)
	return (await Model.find(query).exec()).map(d=>{
		let json = {};
		try{
			json = JSON.parse(d.code);
		}catch(err){}
		return {
			text: d.name,
			value:d._id,
			group: json.group||''
		};
	});
}