require('dotenv').config({
	silent:true
});

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default {
	IS_PRODUCTION
};