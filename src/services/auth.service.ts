import create, { HttpError } from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { signToken } from '../utils/jwt';
import { validateEmail, validatePassword } from '../utils/auth';
import { Prisma } from '.prisma/client';
import { ISignedJWTResponse } from '../models/ISignedJWTPayload.model';

const authErrorRouters: { [key: string]: HttpError } = {
    'P2001': new create.Unauthorized("Unauthorized"),
    'P2002': new create.Conflict("Email already in use")
};

export const login = async (email: string, password: string): Promise<ISignedJWTResponse> => {
    const user = await db.user.findUnique({
        where: { email }
    });

    if (!user)
        throw new create.Unauthorized("User was not found");

    const checkPassword = compareSync(password, user.password);
    if (!checkPassword) throw new create.Unauthorized("Invalid email address or password.");

    return signToken(user);
}

export const register = async (email: string, password: string): Promise<ISignedJWTResponse> => {

    if (!validateEmail(email) || !validatePassword(password))
        throw new create.BadRequest("Invalid format of email or password");

    const lowercaseEmail = (email as string).toLowerCase();
    const hashedPassword = hashSync(password, 10);

    try {
        const user = await db.user.create({
            data: {
                email: lowercaseEmail,
                password: hashedPassword
            }
        });

        if (!user) throw new create.InternalServerError("Internal Server Error");

        return signToken(user);
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            throw authErrorRouters[e.code] || new create.InternalServerError("Internal Server Error");
        }
        throw e;
    }
}