import { validationResult, matchedData } from 'express-validator';
import { handleRequestError } from './../utils/errors';
import { getUserChannelsById, getUserLogs } from './../services/users.service';
import { DEFAULT_LIMIT_COUNT, DEFAULT_OFFSET_COUNT } from './../utils/contants';
import { StatusCodes } from 'http-status-codes';
import create from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import {
    getAllPublicProfiles,
    getSinglePublicProfileByUsername,
    getCompleteUser
} from '../services/users.service';

export const getPublicUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let offset = req.query.offset as string;
        let limit = req.query.limit as string;

        if (!offset) offset = DEFAULT_OFFSET_COUNT.toString();
        if (!limit) limit = DEFAULT_LIMIT_COUNT.toString();

        const intOffset = parseInt(offset); // TODO: Extract 10 to a variable.
        const intLimit = parseInt(limit);

        if (isNaN(intOffset) || isNaN(intLimit))
            throw new create.BadRequest(
                'Limit or offset query have invalid formats. Please use valid unsigned integers.'
            );

        console.log(intLimit, intOffset);
        const users = await getAllPublicProfiles(intOffset, intLimit);

        if (!users) throw new create.InternalServerError('Internal Server Error');

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
                'Missing or invalid \'username\' parameter. Make sure the parameter is a string and is present at the end of the uri.'
            );

        const user = await getSinglePublicProfileByUsername(req.params.username);

        if (!user)
            return res
                .status(StatusCodes.NO_CONTENT)
                .json({ message: 'Request was successful, but no content was found.' });

        return res.status(StatusCodes.OK).json(user);
    } catch (e: any) {
        next(create(e.status, e.message));
    }
};

export const getCompleteUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id.toString() || req.userId;
        if (!id) throw new create.BadRequest('Invalid or missing identifier');

        if (id !== req.userId) throw new create.Unauthorized('Unauthorized');

        const user = await getCompleteUser(id);
        if (!user)
            return res
                .status(StatusCodes.NO_CONTENT)
                .json({ message: 'Request was successful, but no content was found.' });

        return res.status(StatusCodes.OK).json(user);
    } catch (e: any) {
        next(create(e.status, e.message));
    }
};

export const getUserChannelsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const channels = await getUserChannelsById(req.params.id);
        if (!channels) res.status(StatusCodes.NO_CONTENT).json([]);
        else res.status(StatusCodes.OK).json(channels);
    } catch (e: any) {
        next(create(e.status, e.message));
    }
};

export const getUserLogsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: [ 'params', 'query' ] });
        const { id, offset, limit } = data;
        const logs = await getUserLogs(id, offset, limit);

        if (logs.length <= 0) {
            return res.status(StatusCodes.NO_CONTENT).json(logs);
        }
        else {
            return res.status(StatusCodes.OK).json(logs);
        }

    } catch (e) {
        handleRequestError(e, next);
    }
};