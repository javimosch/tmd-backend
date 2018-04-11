const Joi = require('joi');
export const type = 'pre';
export default async function(data) {
	const schema = Joi.object().keys({
		email: Joi.string().email().required(),
		password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
	}).with('email', 'password');
	const result = Joi.validate(data, schema);
	console.warn(result.error);
	if(result.error) throw new Error(result.error.details.map(d=>d.message).join(', '))
}