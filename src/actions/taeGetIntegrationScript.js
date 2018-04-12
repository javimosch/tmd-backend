export const middlewares = [ {
	name:'authenticateSilent',
	params:[{
		model:"tae_user"
	}]},'sessionRequired']
export default async function(){
	return (await this.model('tae_setting').fetchSingleton()).script;
}