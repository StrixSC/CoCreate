import { StatusCodes } from 'http-status-codes';
import { ILoginResponse } from '../models/ILoginResponse.model';
import { IStdResponse } from '../models/IStdResponse.model';

const messages = {
  REGISTER_SUCCESS: {
    message: 'Registration successful',
    status: StatusCodes.CREATED,
    friendlyMessage: 'Inscription complétée avec succès!'
  } as IStdResponse,

  LOGIN_SUCCESS: {
    message: 'Login Success',
    status: StatusCodes.OK,
    friendlyMessage: 'Connexion complétée avec succès!',
    jwt: '',
  } as ILoginResponse
};

export default messages;