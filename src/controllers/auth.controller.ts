import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { login, register } from "../services/auth.service"
import { StatusCodes } from 'http-status-codes';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwt = await login(req.body.email, req.body.password);
    return res.status(StatusCodes.OK).json({ token: jwt });
  } catch (e: any) {
    next(create(e.status, e.message));
  }
};

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jwt = await register(req.body.email, req.body.password);
    res.status(StatusCodes.CREATED).json({ token: jwt });
  } catch (e: any) {
    next(create(e.status, e.message));
  }
};