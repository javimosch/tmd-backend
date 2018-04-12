export const middlewares = [ {
	name:'authenticateSilent',
	params:{
		model:"tae_user"
	}},'sessionRequired']
export default async function taeGetSettings(d){
	return await this.model('tae_setting').findOne({name:'default'}).exec();
}