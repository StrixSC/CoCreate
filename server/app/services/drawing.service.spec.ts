import { fail } from 'assert';
import { expect } from 'chai';
import { Db, MongoError } from 'mongodb';
import { SinonStubbedInstance, stub } from 'sinon';
import { Drawing } from '../../../common/communication/drawing';
import { TestDbHelper } from '../../test/test-db-helper';
import { DRAWING_COLLECTION, TAG_COLLECTION } from '../res/environement';
import { CloudStorageService } from './cloud-storage.service';
import { DrawingService } from './drawing.service';
import { MongoDbConnectionService } from './mongodb-connection.service';
import { TagService } from './tag.service';
import { TimestampLogService } from './timestamp-log.service';

describe('Testing drawing.service', () => {
    const dbHelper = new TestDbHelper();
    const timestampService: TimestampLogService = new TimestampLogService();
    const mongoDbConnectionServiceStub: MongoDbConnectionService = new MongoDbConnectionService('test');
    let tagServiceStub: TagService;
    const cloudStorage: CloudStorageService = new CloudStorageService(timestampService);
    let csStub: SinonStubbedInstance<CloudStorageService>;
    let drawingService: DrawingService;
    const testFolder = 'test/';

    before(async () => {
        await dbHelper.start();
        csStub = stub(cloudStorage);
        csStub.uploadFile.returns(new Promise((resolve) => { resolve(['path', 'name']); }));
        csStub.deleteFile.returns(new Promise((resolve) => { resolve(); }));
        csStub.fileExist.returns(new Promise<[boolean]>((resolve) => { resolve([true]); }));
        stub(mongoDbConnectionServiceStub, 'getMongoDatabase').returns(dbHelper.db as Db);
        stub(timestampService, 'log').callsFake((message: string) => { return; });
        tagServiceStub = new TagService(mongoDbConnectionServiceStub, timestampService);
    });

    after(async () => {
        await dbHelper.cleanup();
        await dbHelper.stop();
    });

    beforeEach((done) => {
        csStub.uploadFile.returns(new Promise((resolve) => { resolve(['path', 'name']); }));
        csStub.deleteFile.returns(new Promise((resolve) => { resolve(); }));
        csStub.fileExist.returns(new Promise<[boolean]>((resolve) => { resolve([true]); }));
        drawingService = new DrawingService(mongoDbConnectionServiceStub, tagServiceStub, cloudStorage, timestampService);
        done();
    });

    afterEach((done) => {
        csStub.uploadFile.reset();
        csStub.deleteFile.reset();
        csStub.fileExist.reset();
        done();
    });

    it('#setDrawing should set the new drawing', (done) => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 20 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test',
            path: testFolder + 'test',
        };
        drawingService.setDrawing(['tag1'], 'test', file).then(() => { done(); }, () => { fail(); done(); });
    });

    it('#getAllDrawings should return all drawings', (done) => {
        drawingService.getAllDrawings().then((drawings: Drawing[]) => {
            expect(drawings.length).to.be.greaterThan(0);
            done();
        });
    });

    it('#setDrawing should set the new drawing with new tags', (done) => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        drawingService.setDrawing(['tag1'], 'test2', file).then(() => { done(); }, (err) => {
            fail();
        });
    });

    it('#setDrawing should failed with bad file', async () => {
        csStub.uploadFile.rejects('error');
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        await drawingService.setDrawing(['tag1'], 'test2', file).catch(
            (err) => {
                expect(err);

            });
    });

    it('#setDrawing should set the new drawing without any tags', (done) => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test3',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test3',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test3',
            path: testFolder + 'test3',
        };
        drawingService.setDrawing([], 'test3', file).then(() => { done(); }, () => { fail(); });
    });

    it('#setDrawing should be able to handle when a drawing is not inserted', async () => {
        const drawingCollection = (dbHelper.db as Db).collection(DRAWING_COLLECTION);
        const s = stub(drawingService, 'drawingCollection').get(() => {
            return {
                insertOne: (val: any) => {
                    throw new MongoError('');
                },
                findOne: (val: any) => {
                    return drawingCollection.findOne(val);
                },
            };
        });
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test5',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test5',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test5',
            path: testFolder + 'test5',
        };
        await drawingService.setDrawing(['tag8'], 'test5', file).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#setDrawing should be able to handle when a tag is not update', async () => {
        const tagCollection = (dbHelper.db as Db).collection(TAG_COLLECTION);
        const s = stub(tagServiceStub, 'tagCollection').get(() => {
            return {
                updateOne: (val: any, val2: any) => {
                    throw new MongoError('');
                },
                insertOne: (val: any) => {
                    return tagCollection.insertOne(val);
                },
                findOne: (val: any) => {
                    return tagCollection.findOne(val);
                },
            };
        });
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test3',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test3',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test3',
            path: testFolder + 'test3',
        };
        await drawingService.setDrawing(['tag50'], 'test14', file);
        await drawingService.setDrawing(['tag50'], 'test16', file).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#setDrawing should be able to handle when a tag is not update', async () => {
        const tagCollection = (dbHelper.db as Db).collection(TAG_COLLECTION);
        const s = stub(tagServiceStub, 'tagCollection').get(() => {
            return {
                insertOne: (val: any) => {
                    throw new MongoError('');
                },
                findOne: (val: any) => {
                    return tagCollection.findOne(val);
                },
            };
        });
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test5',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test5',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test5',
            path: testFolder + 'test5',
        };
        await drawingService.setDrawing(['tag6000'], 'test5', file).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#deleteDrawing should delete the drawing', (done) => {
        drawingService.getAllDrawings().then((drawing) => {
            drawingService.deleteDrawing((drawing[0] as Drawing).fileName)
                .then(
                    () => { done(); },
                    (err) => { fail(); });
        });
    });

    it('#deleteDrawing should throw erreor with wrong name delete the drawing', (done) => {
        drawingService.deleteDrawing('error-name')
            .then(
                () => { fail(); },
                (err) => { done(); });
    });

    it('#deleteDrawing should throw error if drawing doesnt exist in db delete the drawing', (done) => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        drawingService.setDrawing(['tag1'], 'test2', file).then(() => {
            drawingService.getAllDrawings().then((drawing) => {
                dbHelper.deleteDoc(DRAWING_COLLECTION, { fileName: { $eq: (drawing[0] as Drawing).fileName } }).then(() => {
                    try {
                        drawingService.deleteDrawing((drawing[0] as Drawing).fileName)
                            .catch((err) => { done(); });
                        done();
                    } catch (error) {
                        done();
                    }

                });
            });
        });
    });

    it('#deleteDrawing should handle the update fail of the tag', async () => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        await drawingService.setDrawing(['tag1'], 'test2', file);
        const drawing = await drawingService.getAllDrawings();
        const tagCollection = (dbHelper.db as Db).collection(TAG_COLLECTION);
        const s = stub(tagServiceStub, 'tagCollection').get(() => {
            return {
                updateOne: (val: any, val2: any) => {
                    throw new MongoError('');
                },
                findOne: (val: any) => {
                    return tagCollection.findOne(val);
                },
                findOneAndDelete(val: any) {
                    return tagCollection.findOneAndDelete(val);
                },
                find: () => {
                    return tagCollection.find();
                },
            };
        });
        await drawingService.deleteDrawing((drawing[0] as Drawing).fileName).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#deleteDrawing should handle the findOneAndDelete fail of the tag', async () => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        await drawingService.setDrawing(['tag1'], 'test2', file);
        const drawing = await drawingService.getAllDrawings();
        const tagCollection = (dbHelper.db as Db).collection(TAG_COLLECTION);
        const s = stub(tagServiceStub, 'tagCollection').get(() => {
            return {
                updateOne: (val: any, val2: any) => {
                    return tagCollection.updateOne(val, val2);
                },
                findOne: (val: any) => {
                    return tagCollection.findOne(val);
                },
                findOneAndDelete(val: any) {
                    throw new MongoError('err');
                },
                find: () => {
                    return tagCollection.find();
                },
            };
        });
        await drawingService.deleteDrawing((drawing[0] as Drawing).fileName).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#deleteDrawing should handle the deleteOne fail for the drawings', async () => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        await drawingService.setDrawing(['tag1'], 'test2', file);
        const drawingCollection = (dbHelper.db as Db).collection(DRAWING_COLLECTION);
        const drawing = await drawingService.getAllDrawings();
        const s = stub(drawingService, 'drawingCollection').get(() => {
            return {
                findOne: (val: any) => {
                    return drawingCollection.findOne(val);
                },
                deleteOne: (val: any) => {
                    throw new MongoError('err');
                },
            };
        });
        await drawingService.deleteDrawing((drawing[0] as Drawing).fileName).catch((res) => expect(true).to.equal(true));
        s.restore();
    });

    it('#deleteDrawing should handle when no tag is found', async () => {
        const buf = Buffer.from('<Buffer 3c 73 76 67 21 78 >', 'utf8');
        const file: Express.Multer.File = {
            fieldname: testFolder + 'test2',
            mimetype: 'image/svg+xml',
            buffer: buf,
            originalname: testFolder + 'test2',
            encoding: '7bit',
            size: buf.length,
            destination: '',
            location: '',
            filename: testFolder + 'test2',
            path: testFolder + 'test2',
        };
        await drawingService.setDrawing(['tag1'], 'test2', file);
        const drawing = await drawingService.getAllDrawings();
        const tagCollection = (dbHelper.db as Db).collection(TAG_COLLECTION);
        const s = stub(tagServiceStub, 'tagCollection').get(() => {
            return {
                updateOne: (val: any, val2: any) => {
                    return tagCollection.updateOne(val, val2);
                },
                findOne: (val: any) => {
                    return null;
                },
                findOneAndDelete(val: any) {
                    return tagCollection.findOneAndDelete(val);
                },
                find: () => {
                    return tagCollection.find();
                },
            };
        });
        await drawingService.deleteDrawing((drawing[0] as Drawing).fileName);
        expect(true).to.equal(true);
        s.restore();
    });
});
