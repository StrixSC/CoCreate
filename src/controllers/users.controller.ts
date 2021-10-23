import { getSinglePublicProfile } from './../services/users.service';
import { StatusCodes } from 'http-status-codes';
import create from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import { getAllPublicProfiles } from '../services/users.service';

export const getPublicUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getAllPublicProfiles();
        if (!users) {
            throw new create.InternalServerError('Internal Server Error');
        }
        return res.status(StatusCodes.OK).json(users);
    } catch (e: any) {
        next(create(e.status, e.message));
    }
};

export const getPublicUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const username = req.params.username;
        if (!username || typeof username !== 'string')
            throw new create.BadRequest(
                "Missing or invalid 'username' parameter. Make sure the parameter is a string and is present at the end of the uri."
            );

        const users = await getSinglePublicProfile(req.params.username);

        if (!users) throw new create.InternalServerError('Internal Server Error');

        return res.status(StatusCodes.OK).json(users);
    } catch (e: any) {
        next(create(e.status, e.message));
    }
};
