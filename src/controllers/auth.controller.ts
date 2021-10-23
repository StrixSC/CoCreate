import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { register } from '../services/auth.service';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../app';
import { promisify } from 'util';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  res.status(StatusCodes.OK).json({ 'message': 'OK' });
};

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registered = await register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    if (registered) {
      res.status(StatusCodes.CREATED).json({
        message: 'User created successfully.',
      });
    } else {
      throw new create.InternalServerError(
        'The user could not be created. We have reported this issue, please try again later'
      );
    }
  } catch (e: any) {
    next(create(e.status, e.message));
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if(err) {
      return next(new create.InternalServerError());
    }

    return res.status(StatusCodes.OK).json({ 'message': 'OK' });
  });
};
