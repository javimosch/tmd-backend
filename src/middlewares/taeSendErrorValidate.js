const Joi = require('joi');
export const type = 'pre';
export default async function(data) {
	const schema = Joi.object().keys({
		stack: Joi.any(),
	}).unknown(true)
	const result = Joi.validate(data, schema);
	if(result.error) throw new Error(result.error.details.map(d=>d.message).join(', '))
}