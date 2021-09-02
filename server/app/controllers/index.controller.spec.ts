import { expect, request } from 'chai';
import { Application } from '../app';
import { container } from '../inversify.config';
import Types from '../types';
import { IndexServiceMock } from './index.controller.mock';

describe('index.controller', () => {
    describe('/index', () => {
        it('get /text should send the welcome message if success', (done: Mocha.Done) => {
            container.unbind(Types.IndexService);
            container.bind(Types.IndexService).to(IndexServiceMock);
            const app: Application = container.get<Application>(Types.Application);
            request(app.app).get('/api/index/text').end((err, res) => {
                expect(res.body).to.eql({ body: 'body', end: 'end', });
                done();
            });

        });
    });
});
