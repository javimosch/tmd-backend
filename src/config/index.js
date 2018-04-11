require('dotenv').config({
	silent:true
});

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const ERRORS_RES_MODE = process.env.ERRORS_RES_MODE || 'full';

export default {
	IS_PRODUCTION,
	JWT_SECRET,
	ERRORS_RES_MODE
};