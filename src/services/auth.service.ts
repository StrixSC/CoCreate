import create, { HttpError } from 'http-errors';
import { compareSync, hashSync } from 'bcrypt';
import { db } from '../db';
import { signToken } from '../utils/jwt';
import { validateRegistration } from '../utils/auth';
import { Prisma } from '.prisma/client';
import { ISignedJWTResponse } from '../models/ISignedJWTPayload.model';
import { IRegistrationPayload } from '../models/IRegistrationModel';

const authErrorRouters: { [key: string]: HttpError } = {
  'P2001': new create.Unauthorized('Unauthorized'),
  'P2002': new create.Conflict('Username or email already in use')
};

export const login = async (email: string, password: string): Promise<ISignedJWTResponse> => {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user)
    throw new create.Unauthorized('User was not found');

  const checkPassword = compareSync(password, user.password);
  if (!checkPassword) throw new create.Unauthorized('Invalid email address or password.');

  return signToken(user);
};

export const register = async (payload: IRegistrationPayload): Promise<ISignedJWTResponse> => {


  if (!validateRegistration(payload))
    throw new create.BadRequest("Invalid or missing inputs");

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
          create:
          {
            username: username,
            avatarUrl: "",
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

    return signToken(user);
  } catch (e: any) {
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      throw authErrorRouters[e.code] || new create.InternalServerError('Internal Server Error');
    }
    throw e;
  }
};