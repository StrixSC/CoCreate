import { injectable } from 'inversify';
import 'reflect-metadata';
import { ApiEndpoint } from '../../../common/communication/api-endpoint';
import { CONFIG_API_DEF } from '../res/environement';

/// Service pour controller la configuration du REST Api
@injectable()
export class ApiEndpointService {
    /// Retourne le fichier de configuration du REST Api
    async getApiEndpoint(): Promise<ApiEndpoint> {
        return CONFIG_API_DEF;
    }
}
