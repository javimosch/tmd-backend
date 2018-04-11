import {JWT_SECRET} from '../config'
const Cryptr = require('cryptr')
const cryptr = new Cryptr(JWT_SECRET);
 export function encrypt(str){
 	return cryptr.encrypt(str);
 }

 export function decrypt(str){
 	return cryptr.decrypt(str);
 }