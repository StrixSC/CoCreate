import { handleRequestError } from './../utils/errors';
import { IUser } from './../models/IUser.model';
import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { register, logout, findUserById } from '../services/auth.service';
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
    const userId = req.user?.user_id;

    if (!userId) return next(new create.Unauthorized());

    const log = await logout(userId);
    if (!log) return next(new create.InternalServerError());

    req.session.destroy((err) => {
        if (err) {
            return next(new create.InternalServerError());
        }

        return res.status(StatusCodes.OK).json({ message: 'OK' });
    });
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) return next(new create.Unauthorized());

        const user = await findUserById(userId);

        if (!user)
            return next(
                new create.Unauthorized('Invalid or missing userId led to no users being found.')
            );

        res.status(StatusCodes.OK).send({
            userId: user.user_id,
            avatar_url: user.profile.avatar_url,
            username: user.profile.username,
            email: user.email
        });
    } catch (e) {
        handleRequestError(e, next);
    }
};
