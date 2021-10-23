import create, { HttpError } from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { validateRegistration } from '../utils/auth';
import { Prisma, User } from '.prisma/client';
import { IRegistrationPayload } from '../models/IRegistrationModel';

const authErrorRouters: { [key: string]: HttpError } = {
    P2001: new create.Unauthorized('Unauthorized'),
    P2002: new create.Conflict('Username or email already in use')
};

export const findUserById = async (id: string): Promise<User | null> => {
    const user = await db.user.findUnique({
        where: {
            user_id: id
        }
    });
    return user;
};

export const login = async (email: string, password: string): Promise<User> => {
    const user = await db.user.findUnique({
        where: {
            email: email
        }
    });
    if (!user)
        throw new create.Unauthorized(
            'User was not found or user is already logged in on another client.'
        );

    const checkPassword = compareSync(password, user.password);
    if (!checkPassword) throw new create.Unauthorized('Invalid email address or password.');

    return user;
};

export const register = async (payload: IRegistrationPayload): Promise<boolean> => {
    if (!validateRegistration(payload)) throw new create.BadRequest('Invalid or missing inputs');

    let { email, password, username, firstName, lastName } = payload;

    const hashedPassword = hashSync(password, 10);
    email = email.toLowerCase();
    firstName = firstName.normalize();
    lastName = lastName.normalize();

    try {
        const user = await db.user.create({
            data: {
                email: email,
                password: hashedPassword,
                profile: {
                    create: {
                        username: username,
                        avatarUrl: ''
                    }
                },
                account: {
                    create: {
                        first_name: firstName,
                        last_name: lastName
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
