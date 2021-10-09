import { Prisma } from '@prisma/client';
import { compareSync, hash, hashSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { db } from '../db';
import { IStdResponse } from '../models/IStdResponse.model';
import { validateEmail, validatePassword } from '../utils/auth';
import errors from '../utils/errors';
import messages from '../utils/messages';

const authErrorRouters: { [key: string]: IStdResponse } = {
  'P2001': errors.USER_UNAUTHORIZED,
  'P2002': errors.EMAIL_ALREADY_IN_USE,
};

const defaultSaltLength = 10;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user)
      return res.status(errors.USER_UNAUTHORIZED.status).json(errors.USER_UNAUTHORIZED);

    const checkPassword = compareSync(password, user.password);
    if (!checkPassword) {
      return res.status(errors.USER_UNAUTHORIZED.status).json(errors.USER_UNAUTHORIZED);
    }

    const jwt = sign({
      userId: user.user_id,
      email: user.email
    }, process.env.JWT_ACCESS_TOKEN_SECRET || 'secret');

    return res.status(messages.LOGIN_SUCCESS.status).json({ ...messages.LOGIN_SUCCESS, jwt: jwt });

  } catch (e: any) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const error = authErrorRouters[e.code];
      if (error)
        return res.status(error.status).json(error);
    }
    return res.status(errors.SERVER_ERROR.status).json(errors.SERVER_ERROR);
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!validateEmail(email) || !validatePassword(password)) {
    return res.status(errors.INVALID_AUTH_INFO.status).json(errors.INVALID_AUTH_INFO);
  }

  const lowercaseEmail = (email as string).toLowerCase();
  let hashedPassword = '';

  try {
    hashedPassword = hashSync(password, defaultSaltLength);
  } catch (e: any) {
    console.log(e);
    return res.status(errors.SERVER_ERROR.status).json(errors.SERVER_ERROR);
  }

  try {
    await db.user.create({
      data: {
        email: lowercaseEmail,
        password: hashedPassword
      }
    });
    return res.status(messages.REGISTER_SUCCESS.status).json(messages.REGISTER_SUCCESS);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const error = authErrorRouters[e.code];
      if (error)
        return res.status(error.status).json(error);
    }
    return res.status(errors.SERVER_ERROR.status).json(errors.SERVER_ERROR);
  }
};