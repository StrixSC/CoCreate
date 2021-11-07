import { handleRequestError } from './../utils/errors';
import { NextFunction, Request, Response } from 'express';
import create from 'http-errors';
import { register, logout, findUserById, login } from '../services/auth.service';
import { StatusCodes } from 'http-status-codes';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new create.Unauthorized();
        }

        const logged = await login(req.userId);
        if (!logged) {
            throw new create.InternalServerError('Could not log user sign in.');
        }
        return res
            .status(StatusCodes.ACCEPTED)
            .json({ message: 'User connection logged successfully' });
    } catch (e) {
        return handleRequestError(e, next);
    }
};

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await register({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name
        });

        if (!user) {
            throw new create.InternalServerError('Could not create user');
        }
        return res
            .status(StatusCodes.CREATED)
            .send({ message: 'The user has been created successfully!' });
    } catch (e) {
        handleRequestError(e, next);
    }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) return next(new create.Unauthorized());

        const log = await logout(userId);
        if (!log) return next(new create.InternalServerError());

        return res.status(StatusCodes.OK).json({ message: 'OK' });
    } catch (e) {
        return handleRequestError(e, next);
    }
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
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
