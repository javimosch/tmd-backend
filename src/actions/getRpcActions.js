//import db from './src/modules/db';
export default async function(){
	const {db} = this;
	let ApiAction = db.conn().model('api_action');
	return await ApiAction.find({}).exec();
}