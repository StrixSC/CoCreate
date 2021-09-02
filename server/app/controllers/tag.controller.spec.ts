import { expect, request } from 'chai';
import { Tag } from '../../../common/communication/drawing';
import { Application } from '../app';
import { container } from '../inversify.config';
import Types from '../types';
import { TagServiceMock, TagServiceMockFail } from './tag.controller.mock';

describe('tag.controller', () => {
    describe('/tag', () => {
        it('get / should send all tags if success', (done: Mocha.Done) => {
            container.unbind(Types.TagService);
            container.bind(Types.TagService).to(TagServiceMock);
            const app: Application = container.get<Application>(Types.Application);
            const tagList: Tag[] = [{
                name: 'name',
                numberOfUses: 0,
            }];
            request(app.app).get('/api/tags').end((err, res) => {
                expect(res.body).to.eql(tagList);
                done();
            });
        });

        it('get / should send status 500 if fails', (done: Mocha.Done) => {
            container.unbind(Types.TagService);
            container.bind(Types.TagService).to(TagServiceMockFail);
            const app: Application = container.get<Application>(Types.Application);
            request(app.app).get('/api/tags').end((err, res) => {
                expect(res.status).to.eql(500);
                done();
            });
        });
    });
});
