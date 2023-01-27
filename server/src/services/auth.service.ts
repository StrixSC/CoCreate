import { uploadToBucket } from './../utils/users';
import create from 'http-errors';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import {
    LogType,
    User,
    MemberType,
    Log
} from 'prisma/prisma-client';
import { IRegistrationPayload } from '../models/IRegistrationModel';
import { admin, bucket } from '../firebase';
import log from '../utils/logger';
import { v4 } from 'uuid';

export const findUserById = async (
    id: string
): Promise<any> => {
    const user = await db.user.findUnique({
        where: {
            user_id: id
        },
        include: {
            profile: true
        }
    });
    return user;
};

export const login = async (
    userId: string
): Promise<Log | null> => {
    const log = await db.log.create({
        data: {
            type: LogType.Connection,
            user_id: userId
        }
    });

    return log;
};

export const register = async (
    payload: IRegistrationPayload,
    avatar_url: string,
    uid?: string
): Promise<User | null> => {
    let {
        // eslint-disable-next-line prefer-const
        email,
        // eslint-disable-next-line prefer-const
        password,
        // eslint-disable-next-line prefer-const
        username,
        first_name,
        last_name
    } = payload;

    first_name = first_name.normalize();
    last_name = last_name.normalize();

    const usernameFound =
        await db.profile.findFirst({
            where: { username: username }
        });

    if (usernameFound) {
        throw new create.Conflict(
            'There is already a user with this username.'
        );
    }

    console.log(payload, uid);
    const user = await db.user.create({
        data: {
            user_id: uid ? uid : v4(),
            email: email,
            profile: {
                create: {
                    username: username,
                    avatar_url: avatar_url
                }
            },
            account: {
                create: {
                    first_name: first_name,
                    last_name: last_name
                }
            },
            stats: {
                create: {
                    total_collaboration_sessions: 0,
                    total_collaboration_time: 0
                }
            },
            channels: {
                create: [
                    {
                        channel_id: 'PUBLIC',
                        type: MemberType.Regular
                    }
                ]
            },
            avatars: {
                create: [
                    {
                        avatar_url: avatar_url,
                        isPublic: false
                    }
                ]
            }
        }
    });

    if (!user) {
        throw new create.InternalServerError(
            'Could not create the database at the moment. Please try again later.'
        );
    }

    const firebaseUser = await admin
        .auth()
        .createUser({
            uid: user.user_id,
            email: user.email,
            password: password,
            displayName: username,
            photoURL: avatar_url
        });

    if (!firebaseUser) {
        const deletedUser = await db.user.delete({
            where: {
                user_id: user.user_id
            }
        });

        if (!deletedUser) {
            throw new create.InternalServerError(
                'Could not delete pending created user after error with registration. Contact an administrator.'
            );
        }

        throw new create.InternalServerError(
            'Could not create a firebase user. Contact an administrator.'
        );
    }

    return user;
};

export const registerWithFileUpload = async (
    payload: IRegistrationPayload,
    file: Express.Multer.File
) => {
    const userId = v4();
    const { url, bucketFile } =
        await uploadToBucket(userId, file);

    if (!url || !bucketFile) {
        throw new create.InternalServerError(
            'Something happened while uploading avatar'
        );
    }

    const user = register(payload, url, userId);
    if (!user) {
        throw new create.InternalServerError(
            'Failed to create user, operation reverted'
        );
    } else {
        return user;
    }
};

export const logout = async (userId: string) => {
    const log = await db.log.create({
        data: {
            user_id: userId,
            type: LogType.Disconnection
        }
    });
    await admin
        .auth()
        .revokeRefreshTokens(userId);

    return log;
};

export const updateUserPassword = async (
    userId: string,
    password: string
) => {
    const updated = await admin
        .auth()
        .updateUser(userId, {
            password: password
        });

    if (updated) {
        return true;
    } else {
        return false;
    }
};
