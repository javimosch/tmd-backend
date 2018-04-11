const Joi = require('joi');
export const type = 'pre';
export default async function(data) {
	const schema = Joi.object().keys({
		_id: Joi.string().allow(null),
		email: Joi.string().email().required(),
		role: Joi.string().regex(/normal|root/i),
		password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
	}).unknown(true)
	const result = Joi.validate(data, schema);
	if(result.error) throw new Error(result.error.details.map(d=>d.message).join(', '))
}