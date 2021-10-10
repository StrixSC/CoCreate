import { IStdResponse } from './IStdResponse.model';

export interface ILoginResponse extends IStdResponse {
    jwt: string;
    refreshToken: string;
}