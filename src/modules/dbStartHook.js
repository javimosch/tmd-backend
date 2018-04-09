import db from './db';
import sequential from 'promise-sequential';

export default async function (){
	const Field = db.conn().model('field');

	//removeProperty(Field,'group',undefined);
	
}


async function removeProperty(model, prop,val){
	let docs = await model.find({}).exec();
	console.log('removeProperty','from',model.name,'property',prop,await sequential(docs.map(d=>{
		return async()=>{
			d[prop]=val;
			await d.save();
		};
	})))
}