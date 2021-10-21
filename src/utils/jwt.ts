import { JwtPayload, sign } from 'jsonwebtoken';
import create from 'http-errors';
import { User } from '.prisma/client';
import { ISignedJWTResponse } from '../models/ISignedJWTPayload.model';

const secret = process.env.ACCESS_TOKEN_SECRET; // TODO: Will need to eventually change this to a dedicated Private/Public key pair.

// TODO: Remove user_id from the sub.
export const signToken = (user: User): ISignedJWTResponse => {
  try {
    const payload: JwtPayload = {
      sub: user.user_id, // TODO: Maybe need to encrypt this.
      iat: Math.floor(Date.now() / 1000), // IAT needs to be in seconds.
    };
    
    const expiresIn = process.env.TOKEN_EXPIRY_TIME || '1d';
    const token = sign(payload, secret || 'secret', { expiresIn: expiresIn });

    return {
      token: 'Bearer ' + token,
      expires: expiresIn
    };

  } catch (e: any) {
    console.error(e);
    throw new create.InternalServerError('Unexpected error');
  }
};