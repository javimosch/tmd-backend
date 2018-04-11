export const type = 'post';
export default async function(data) {
	console.info('RESPONSE LOGGER',data)
	return data?data:'Foo'
}