import { IRegistrationPayload } from '../models/IRegistrationModel';

export const dbErrorRouters: { [key: string]: string } = {
    P2001: "Hmm... On dirait que vous n'êtes pas autorisée d'effectuer cette requête...",
    P2002: "Oups! Il y a eu un conflit. On dirait qu'une ou plusieurs informations que vous avez entrées sont déjà utilisées par un autre utilisateur. Veuillez revérifier les champs que vous avez entrez!"
};

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
    valid = validateName(payload.first_name);
    valid = validateName(payload.last_name);
    valid = validateUsername(payload.username);

    return valid;
};
