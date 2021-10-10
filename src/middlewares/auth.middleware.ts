import create from 'http-errors';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (!token)
        return next(create(StatusCodes.UNAUTHORIZED, "Invalid or missing token"));
    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (e: any) {
        next(create(e.status, e.message));
    }

}