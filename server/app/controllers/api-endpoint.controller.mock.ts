import { injectable } from 'inversify';
import { ApiEndpoint } from '../../../common/communication/api-endpoint';
import { CONFIG_API_DEF } from '../res/environement';
import { ApiEndpointService } from '../services/api-endpoint.service';

@injectable()
export class DefServiceMockFail implements ApiEndpointService {
    getApiEndpoint(): Promise<ApiEndpoint> {
        return new Promise<ApiEndpoint>((_, reject) => reject('error'));
    }
}

// tslint:disable-next-line: max-classes-per-file
@injectable()
export class DefServiceMock implements ApiEndpointService {
    getApiEndpoint(): Promise<ApiEndpoint> {
        return new Promise<ApiEndpoint>((resolve) => resolve(CONFIG_API_DEF));
    }
}
