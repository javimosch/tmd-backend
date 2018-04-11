
import jwt from 'jsonwebtoken';
import { JWT_SECRET, IS_PRODUCTION, JWT_SECRET_DURATION } from '../config';
import mongoose from 'mongoose';
import db from './db';

export function jwtSign(data) {
  return jwt.sign(data, JWT_SECRET, {
    expiresIn: JWT_SECRET_DURATION
  });
}

export function jwtVerify(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if(!IS_PRODUCTION){
          console.log('jwtVerify',JWT_SECRET,'TOKEN',token,'ERROR',err)
        }
        return reject(err);
      }
      if(!IS_PRODUCTION){
          console.log('jwtVerify','DECODED',decoded)
        }
      return resolve(decoded);
    });
  });
}

export async function getUserFromToken(token) {
  if (!token) {
    return null;
  }
  if (token === 'none') {
    return null;
  }

  try {
    let decoded = await jwtVerify(token);
    let doc = await db.conn().model('user').findById(decoded.userId).exec();
    return doc;
  } catch ( err ) {
    // console.log('JWT', err);
    return null;
  }
}