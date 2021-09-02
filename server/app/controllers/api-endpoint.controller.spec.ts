import { expect, request, use } from 'chai';
// tslint:disable-next-line: no-require-imports
import chaiHttp = require('chai-http');
import { Application } from '../app';
import { container } from '../inversify.config';
import { CONFIG_API_DEF } from '../res/environement';
import Types from '../types';
import { DefServiceMock, DefServiceMockFail } from './api-endpoint.controller.mock';

use(chaiHttp);
describe('def.controller', () => {
    describe('/def', () => {
        let app: Application;
        it('get / should send apidef if success', (done: Mocha.Done) => {
            container.unbind(Types.ApiEndpointService);
            container.bind(Types.ApiEndpointService).to(DefServiceMock);
            app = container.get<Application>(Types.Application);
            request(app.app).get('/api').end((err, res) => {
                // tslint:disable-next-line: no-unused-expression
                expect(res).to.have.status(200);
                expect(res.body).to.be.eql(CONFIG_API_DEF);
                done();
            });

        });

        it('get / should send status 500 if fails', (done: Mocha.Done) => {
            container.unbind(Types.ApiEndpointService);
            container.bind(Types.ApiEndpointService).to(DefServiceMockFail);
            app = container.get<Application>(Types.Application);
            request(app.app).get('/api').end((err, res) => {
                // tslint:disable-next-line: no-unused-expression
                expect(res).to.have.status(500);
                done();
            });
        });
    });
});
