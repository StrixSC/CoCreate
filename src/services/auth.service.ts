import create from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import { Prisma, User } from '.prisma/client';
import { IRegistrationPayload } from '../models/IRegistrationModel';
import { authErrorRouters } from '../utils/auth';

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
            email: email
        },
        include: {
            profile: true
        }
    });
    if (!user) return null;

    const checkPassword = compareSync(password, user.password);
    if (!checkPassword) return null;

    return user;
};

export const register = async (payload: IRegistrationPayload): Promise<boolean> => {
    if (!validateRegistration(payload)) throw new create.BadRequest('Invalid or missing inputs');

    let { email, password, username, first_name, last_name } = payload;

    const hashedPassword = hashSync(password, 10);
    email = email.toLowerCase();
    first_name = first_name.normalize();
    last_name = last_name.normalize();

    try {
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
                }
            }
        });

        if (!user) throw new create.InternalServerError('Internal Server Error');

        return true;
    } catch (e: any) {
        console.log(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            throw (
                authErrorRouters[e.code] || new create.InternalServerError('Internal Server Error')
            );
        }
        throw e;
    }
};
