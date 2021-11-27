import { db } from './../db';
import admin from 'firebase-admin';
import { validationResult, matchedData } from 'express-validator';
import { handleRequestError } from './../utils/errors';
import { getUserChannelsById, getUserLogs, updateUserProfile, getUserAvatars } from './../services/users.service';
import { DEFAULT_LIMIT_COUNT, DEFAULT_OFFSET_COUNT } from './../utils/contants';
import { StatusCodes } from 'http-status-codes';
import create from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import {
    getAllPublicProfiles,
    getSinglePublicProfileByUsername,
    getCompleteUser
} from '../services/users.service';
import moment from 'moment';

const bucket = admin.storage().bucket();
const auth = admin.auth();

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
        const file = req.file as Express.Multer.File;
        const userId = req.userId;
        const timestamp = moment().toDate().toISOString();
        const type = file.originalname.split('.')[1];

        if (!type) {
            throw new create.BadRequest('Invalid type associated with filename. Please ensure the filename has a valid name, followed by a "." and a valid type.')
        }

        const fileName = `${userId}_${timestamp}.${type}`;
        const bucketFile = bucket.file(`${userId}/` + fileName);

        await bucketFile.save(file.buffer, {
            contentType: file.mimetype,
            gzip: true
        });

        const [url] = await bucketFile.getSignedUrl({
            action: "read",
            expires: "01-01-2050"
        })

        if (!url) {
            throw new create.InternalServerError('An error has occurred while uploading avatar');
        }

        const uploadedAvatar = await db.avatar.create({
            data: {
                user_id: userId,
                isPublic: false,
                avatar_url: url
            }
        });

        if (!uploadedAvatar) {
            bucketFile.delete({ ignoreNotFound: true }, (err) => {
                if (err) {
                    throw new create.InternalServerError(err.message);
                }

                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': 'An error occurred while uploading the file. Operation reverted.' })
            });
        } else {
            const previousProfile = await db.profile.findUnique({
                where: { user_id: userId }
            });

            if (!previousProfile) {
                await db.avatar.delete({
                    where: {
                        avatar_id: uploadedAvatar.avatar_id
                    }
                });

                bucketFile.delete({ ignoreNotFound: true }, (err) => {
                    if (err) {
                        throw new create.InternalServerError(err.message);
                    }

                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': 'An error occurred while uploading the file. Operation reverted.' })
                });
            }

            const updatedProfile = await db.profile.update({
                where: {
                    user_id: userId,
                },
                data: {
                    avatar_url: uploadedAvatar.avatar_url
                }
            });

            if (!updatedProfile) {
                await db.avatar.delete({
                    where: {
                        avatar_id: uploadedAvatar.avatar_id
                    }
                });

                bucketFile.delete({ ignoreNotFound: true }, (err) => {
                    if (err) {
                        throw new create.InternalServerError(err.message);
                    }

                    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': 'An error occurred while uploading the file. Operation reverted.' })
                });
            } else {
                const updatedAuthProfile = await auth.updateUser(userId, {
                    photoURL: updatedProfile.avatar_url
                });

                if (!updatedAuthProfile) {
                    await db.avatar.delete({
                        where: {
                            avatar_id: uploadedAvatar.avatar_id
                        }
                    });

                    await db.profile.update({
                        where: {
                            user_id: userId
                        },
                        data: {
                            avatar_url: previousProfile!.avatar_url
                        }
                    });

                    bucketFile.delete({ ignoreNotFound: true }, (err) => {
                        if (err) {
                            throw new create.InternalServerError(err.message);
                        }

                        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'message': 'An error occurred while uploading the file. Operation reverted.' })
                    });
                } else {
                    res.status(StatusCodes.OK).json({ 'message': 'Avatar uploaded successfully and updated user avatar!' })
                }

            }
        }
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