
import jwt from 'jsonwebtoken';
import { JWT_SECRET, IS_PRODUCTION, JWT_SECRET_DURATION } from '../config';
import mongoose from 'mongoose';
import db from './db';

export function jwtSign(data,duration) {
  return jwt.sign(data, JWT_SECRET, {
    expiresIn: duration || JWT_SECRET_DURATION
  });
}

export function jwtVerify(token) {
  return new Promise(function jwtVerify(resolve, reject){
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

export async function getUserFromToken(token,modelName = "user") {
  if (!token) {
    return null;
  }
  if (token === 'none') {
    return null;
  }

  try {
    let decoded = await jwtVerify(token);
    if(!decoded.userId) return null;
    if(decoded.model){
      modelName = decoded.model;
    }
    let doc = await db.conn().model(modelName).findById(decoded.userId).exec();
    return doc;
  } catch ( err ) {
    // console.log('JWT', err);
    return null;
  }
}

export async function getSessionFromToken(token) {
  if (!token) {
    return null;
  }
  if (token === 'none') {
    return null;
  }

  try {
    let decoded = await jwtVerify(token);
    if(!decoded.sessionId) return null;
    
    let doc = await db.conn().model('session').findById(decoded.sessionId).exec();
    
    return doc;
  } catch ( err ) {
    // console.log('JWT', err);
    return null;
  }
}