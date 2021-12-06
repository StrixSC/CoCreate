import { db } from './../db';
import admin from 'firebase-admin';
import { validationResult, matchedData } from 'express-validator';
import { handleRequestError } from './../utils/errors';
import { getUserChannelsById, getUserLogs, updateUserProfile, getUserAvatars, getUserTeams, uploadAndUpdateUserAvatar } from './../services/users.service';
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

export const updateUserConfidentialityController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['body'] });
        const { value } = data;
        const user = await db.account.update({
            where: {
                user_id: req.userId
            },
            data: {
                allow_searching: value
            }
        });

        if (!user) {
            throw new create.InternalServerError("Oups! Une erreur s'est produite lors du traitement de la requête... veuillez réessayer à nouveau.")
        }

        return res.status(StatusCodes.OK).json();
    } catch (e) {
        handleRequestError(e, next);
    }
}

export const getCompleteUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await getCompleteUser(req.userId);
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

export const getUserTeamsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        const teams = await getUserTeams(userId);

        const code = teams.length <= 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK;
        return res.status(code).json({
            teams: teams.map((t) => ({
                teamName: t.team.team_name,
                teamId: t.team_id
            }))
        })
    } catch (e) {
        handleRequestError(e, next);
    }
}

export const getUserLogsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['query'] });
        const { offset, limit } = data;
        const logs = await getUserLogs(req.userId, offset, limit);

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

export const updateUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req).array();

        if (errors.length > 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: errors
            });
        }

        const data = matchedData(req, { locations: ['body'] });
        const { username, avatarUrl } = data;

        const updated = await updateUserProfile(req.userId, username, avatarUrl);

        if (!updated) {
            throw new create.InternalServerError('Something happened while processing the request. Nothing was updated.');
        }

        return res.status(StatusCodes.OK).json({
            username: username,
            avatarUrl: avatarUrl
        });
    } catch (e) {
        handleRequestError(e, next);
    }
}

export const uploadAndChangeUserAvatarController = async (req: any, res: any, next: any) => {
    try {
        const file = req.files[0];
        if (!file) {
            throw new create.BadRequest("Hmm... On dirait que nous n'avons pas reçu une image valide...");
        }

        const updated = await uploadAndUpdateUserAvatar(req.userId, file);
        if (!updated) {
            throw new create.InternalServerError("Oops! Quelque chose s'est produit lors du changement de la photo de profile...");
        }

        res.status(StatusCodes.OK).json({
            avatar_url: updated.avatar_url
        });
    } catch (e) {
        handleRequestError(e, next);
    }
}

export const getUserAvatarsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        const avatars = await getUserAvatars(userId)

        if (!avatars) {
            throw new create.InternalServerError('Could not fetch user avatars: Internal Server Error');
        }

        if (avatars.length <= 0) {
            return res.status(StatusCodes.NO_CONTENT).json({ avatars: [] });
        }

        return res.status(StatusCodes.OK).json({ avatars: avatars.map((a) => a.avatar_url) });
    } catch (e) {
        handleRequestError(e, next);
    }
}