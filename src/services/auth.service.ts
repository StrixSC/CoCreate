import create from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import { LogType, User, MemberType } from '.prisma/client';
import { IRegistrationPayload } from '../models/IRegistrationModel';

export const findUserById = async (id: string): Promise<User | null> => {
    const user = await db.user.findUnique({
        where: {
            user_id: id
        }
    });
    return user;
};

export const login = async (email: string, password: string): Promise<User | null> => {
    const user = await db.user.findUnique({
        where: {
            email: email.toLowerCase()
        },
        include: {
            profile: true
        }
    });
    if (!user) return null;

    const checkPassword = compareSync(password, user.password);
    if (!checkPassword) return null;

    await db.log.createMany({
        data: {
            type: LogType.Connection,
            user_id: user.user_id
        }
    });

    return user;
};

export const register = async (payload: IRegistrationPayload): Promise<User | null> => {
    // TODO: Express validator:
    if (!validateRegistration(payload)) throw new create.BadRequest('Invalid or missing inputs');

    let { email, password, username, first_name, last_name } = payload;

    const hashedPassword = hashSync(password, 10);
    email = email.toLowerCase();
    first_name = first_name.normalize();
    last_name = last_name.normalize();

    const user = await db.user.create({
        data: {
            email: email,
            password: hashedPassword,
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

    return user;
};

export const logout = async (userId: string) => {
    const log = await db.log.create({
        data: {
            user_id: userId,
            type: LogType.Disconnection
        }
    });

    return log;
};
