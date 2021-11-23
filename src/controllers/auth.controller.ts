import { updateUserPassword } from './../services/auth.service';
import { validationResult, matchedData } from 'express-validator';
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

export const registerController = async (req: any, res: any, next: any) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['body'] });
        const { username, email, password, first_name, last_name } = data;

        const user = await register({
            username: username,
            email: email,
            password: password,
            first_name: first_name,
            last_name: last_name
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

        if (!userId) {
            throw new create.Unauthorized()
        }

        const log = await logout(userId);

        if (!log) {
            throw new create.InternalServerError()
        }

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

export const updateUserPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['body'] });
        const { password } = data;
        const updatedUser = await updateUserPassword(req.userId, password);

        if (!updatedUser) {
            throw new create.InternalServerError('Could not update user password');
        }

        return res.status(StatusCodes.OK).json({ message: "OK" });
    } catch (e) {
        handleRequestError(e, next);
    }
}