import create from 'http-errors';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import { LogType, User, MemberType, Log } from '.prisma/client';
import { IRegistrationPayload } from '../models/IRegistrationModel';
import { admin } from '../firebase';
import log from '../utils/logger';
import { v4 } from 'uuid';

export const findUserById = async (id: string): Promise<any> => {
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

export const login = async (userId: string): Promise<Log | null> => {
    const log = await db.log.create({
        data: {
            type: LogType.Connection,
            user_id: userId
        }
    });

    return log;
};

export const register = async (payload: IRegistrationPayload): Promise<User | null> => {
    let { email, password, username, first_name, last_name } = payload;

    first_name = first_name.normalize();
    last_name = last_name.normalize();

    try {
        const usernameFound = await db.profile.findFirst({ where: { username: username } });

        if (usernameFound) {
            throw new create.Conflict('There is already a user with this username.');
        }

        const user = await db.user.create({
            data: {
                email: email,
                profile: {
                    create: {
                        username: username,
                        avatar_url: ''
                    }
                },
                account: {
                    create: {
                        first_name: first_name,
                        last_name: last_name
                    }
                },
                channels: {
                    create: [{ channel_id: 'PUBLIC', type: MemberType.Regular }]
                }
            }
        });

        if (!user) {
            throw new create.InternalServerError('Could not create the database at the moment. Please try again later.')
        }

        const firebaseUser = await admin.auth().createUser({
            uid: user.user_id,
            email: user.email,
            password: password,
            displayName: username,
        });

        if (!firebaseUser) {
            const deletedUser = await db.user.delete({
                where: {
                    user_id: user.user_id
                }
            });

            if (!deletedUser) {
                throw new create.InternalServerError('Could not delete pending created user after error with registration. Contact an administrator.')
            }

            throw new create.InternalServerError('Could not create a firebase user. Contact an administrator.')
        }

        return user
    } catch (e) {
        throw e;
    }
};

export const logout = async (userId: string) => {
    const log = await db.log.create({
        data: {
            user_id: userId,
            type: LogType.Disconnection
        }
    });
    await admin.auth().revokeRefreshTokens(userId);

    return log;
};

export const updateUserPassword = async (userId: string, password: string) => {
    const updated = await admin.auth().updateUser(userId, {
        password: password
    });

    if (updated) {
        return true;
    } else {
        return false;
    }
}