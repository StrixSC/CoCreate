import { Request } from 'express';
import { IRegistrationPayload } from '../models/IRegistrationModel';

const validateEmail = (email: string): boolean => {
    if (typeof email !== 'string') {
        return false;
    }

    return email ? true : false;
};

const validatePassword = (password: string): boolean => {
    if (typeof password !== 'string') {
        return false;
    }

    return password ? true : false;
};

const validateName = (name: string): boolean => {
    if (typeof name !== 'string') {
        return false;
    }

    return name ? true : false;
};

const validateUsername = (username: string): boolean => {
    if (typeof username !== 'string') {
        return false;
    }

    return username ? true : false;
};

export const validateRegistration = (payload: IRegistrationPayload): boolean => {
    let valid = true;

    valid = validateEmail(payload.email);
    valid = validatePassword(payload.password);
    valid = validateName(payload.firstName);
    valid = validateName(payload.lastName);
    valid = validateUsername(payload.username);

    return valid;
};

export const handleInvalidJWT = (req: Request, err: any, jwt: any, info: any) => {
    console.log(req, err, jwt, info);
};
