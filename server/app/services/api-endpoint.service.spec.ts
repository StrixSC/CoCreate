import { expect } from 'chai';
import { ApiEndpoint } from '../../../common/communication/api-endpoint';
import { CONFIG_API_DEF } from '../res/environement';
import { ApiEndpointService } from './api-endpoint.service';

describe('Testing def.service', () => {
    it('should return def resources', (done) => {
        const defService = new ApiEndpointService();
        defService.getApiEndpoint().then((def: ApiEndpoint) => {
            expect(def).to.be.equal(CONFIG_API_DEF);
            done();
        });
    });
});
