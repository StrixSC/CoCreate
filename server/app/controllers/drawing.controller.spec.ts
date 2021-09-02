import { expect, request, use } from 'chai';
// tslint:disable-next-line: no-require-imports
import chaiHttp = require('chai-http');
import { Drawing } from '../../../common/communication/drawing';
import { Application } from '../app';
import { container } from '../inversify.config';
import Types from '../types';
import {
    DrawingServiceMock,
    DrawingServiceMockFail,
    DrawingServiceMockFailDelete,
    DrawingServiceMockFailGet
} from './drawing.controller.mock';

use(chaiHttp);
describe('drawing.controller', () => {
    describe('/drawings', () => {
        let app: Application;

        it('get / should send all drawings if success', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMock);
            app = container.get<Application>(Types.Application);
            const drawings: Drawing[] = [{
                name: 'name',
                tags: ['tag1'],
                createdAt: new Date(),
                path: 'svg/svg',
                fileName: 'file.svg',
            }];
            request(app.app).get('/api/drawings').end((err, res) => {
                expect(res.body[0].name).to.eql(drawings[0].name);
                done();
            });
        });

        it('get / should send status 500 if fails', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMockFail);
            app = container.get<Application>(Types.Application);
            request(app.app).get('/api/drawings').end((err, res) => {
                expect(res.status).to.equal(500);
                done();
            });
        });

        it('post / should add new drawing and return new drawing with new id if success', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMock);
            app = container.get<Application>(Types.Application);
            request(app.app).post('/api/drawings')
                .attach('svg', __dirname + '/mockfile/test.txt')
                .field({ tags: '["tag"]', name: 'test' })
                .end((err, res) => {
                    expect(res.body.success).to.eql(true);
                    done();
                });
        });

        it('post / should send status 500 if fails', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMockFail);
            app = container.get<Application>(Types.Application);
            request(app.app).post('/api/drawings')
                .field({ tags: '["tag"]', name: 'test' }).end((err, res) => {
                    expect(res.status).to.eql(500);
                    done();
                });
        });

        it('delete / should send status 500 if fails', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMockFail);
            app = container.get<Application>(Types.Application);
            request(app.app).delete('/api/drawings/delete-svg').end((err, res) => {
                expect(res.status).to.equal(500);
                done();
            });
        });

        it('delete / should send status 500 if fails to get the drawing', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMockFailGet);
            app = container.get<Application>(Types.Application);
            request(app.app).delete('/api/drawings/delete-svg').end((err, res) => {
                expect(res.status).to.equal(500);
                done();
            });
        });

        it('delete / should send status 500 if fails to delete drawing', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMockFailDelete);
            app = container.get<Application>(Types.Application);
            request(app.app).delete('/api/drawings/delete-svg').end((err, res) => {
                expect(res.status).to.equal(500);
                done();
            });
        });

        it('delete / should succeed', (done: Mocha.Done) => {
            container.unbind(Types.DrawingService);
            container.bind(Types.DrawingService).to(DrawingServiceMock);
            app = container.get<Application>(Types.Application);
            request(app.app).delete('/api/drawings/delete-svg').end((err, res) => {
                expect(res.status).to.equal(200);
                done();
            });
        });
    });
});
