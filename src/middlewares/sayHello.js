export const type = 'post';
export default async function(data,otherName) {
	return 'HELLO '+data.toString()+(otherName?('From '+otherName):'')
}