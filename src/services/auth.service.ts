import create from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import { LogType, User, MemberType, Profile, Log } from '.prisma/client';
import { IRegistrationPayload } from '../models/IRegistrationModel';
import { admin } from '../firebase';
import log from '../utils/logger';

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
    // TODO: Express validator:
    log('DEBUG', JSON.stringify(payload));
    if (!validateRegistration(payload)) throw new create.BadRequest('Invalid or missing inputs');

    let { email, password, username, first_name, last_name } = payload;

    first_name = first_name.normalize();
    last_name = last_name.normalize();

    try {
        const usernameFound = await db.profile.findFirst({ where: { username: username } });

        if (usernameFound) {
            throw new create.Conflict('There is already a user with this username.');
        }

        const firebaseUser = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: username
        });

        const user = await db.user.create({
            data: {
                email: email,
                user_id: firebaseUser.uid,
                profile: {
                    create: {
                        username: username,
                        avatar_url: firebaseUser.photoURL || ''
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

        return user;
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
