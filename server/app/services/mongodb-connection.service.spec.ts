import { fail } from 'assert';
import { expect } from 'chai';
import { MongoDbConnectionService } from './mongodb-connection.service';

describe('Testing mongodb-connnection.service', () => {

    let mongoService: MongoDbConnectionService;
    before(async () => {
        mongoService = new MongoDbConnectionService('test');
        await mongoService.openConnectionWithMongoServer();
    });

    it('should be defined', () => {
        expect(mongoService);
    });

    it('#getMongoClient should return a connect mongoClient', () => {
        const monogoClient = mongoService.getMongoClient();
        expect(monogoClient);
    });

    it('#closeConnectionWithMongoServer should close mongoClient', async () => {
        await mongoService.closeConnectionWithMongoServer();
        try {
            mongoService.getMongoClient();
            fail();
        } catch (e) {
            expect(e);
        }
    });

    it('#openConnectionWithMongoServer should connect mongoClient', async () => {
        await mongoService.closeConnectionWithMongoServer();
        await mongoService.openConnectionWithMongoServer();
        expect(mongoService.getMongoClient());
    });

    it('#getMongoDatabase should return a database', (done) => {
        expect(mongoService.getMongoDatabase());
        done();
    });

});
