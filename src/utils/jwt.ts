import { JwtPayload, sign } from 'jsonwebtoken';
import create from 'http-errors';
import { User } from '.prisma/client';
import { ISignedJWTResponse } from '../models/ISignedJWTPayload.model';

const secret = process.env.ACCESS_TOKEN_SECRET;

export const signToken = (user: User): ISignedJWTResponse => {
  try {

    const payload: JwtPayload = {
      sub: user.user_id,
      iat: Date.now()
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