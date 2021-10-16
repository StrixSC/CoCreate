import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { login, register } from '../services/auth.service';
import { StatusCodes } from 'http-status-codes';
import passport from '../passport';
import { info } from 'console';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate('local', { session: false }, (err, jwt) => {
      if (err || !jwt) {
        throw info;
      }

      req.login(jwt, { session: false }, (err) => {
        if (err) throw err;
        return res.json(jwt);
      });
    });
    
    const token = await login(req.body.email, req.body.password);
    return res.status(StatusCodes.OK).json(token);
  } catch (e: any) {
    next(create(e.status, e.message));
  }
};

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await register({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });
    res.status(StatusCodes.CREATED).json(token);
  } catch (e: any) {
    next(create(e.status, e.message));
  }
};