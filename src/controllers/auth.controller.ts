import { handleRequestError } from './../utils/errors';
import { IUser } from './../models/IUser.model';
import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { register } from '../services/auth.service';
import { StatusCodes } from 'http-status-codes';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({
    user_id: req.user?.user_id,
    email: req.user?.email,
    username: req.user?.profile.username,
    avatar_url: req.user?.profile.avatar_url
  } as IUser);
};

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registered = await register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      first_name: req.body.first_name,
      last_name: req.body.last_name
    });
    if (!registered)
      throw new create.InternalServerError(
        'The user could not be created. We have reported this issue, please try again later'
      );

    return res.status(StatusCodes.CREATED).json({
      message: 'User created successfully.'
    });
  } catch (e: any) {
    handleRequestError(e, next);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new create.InternalServerError());
    }

    return res.status(StatusCodes.OK).json({ message: 'OK' });
  });
};
