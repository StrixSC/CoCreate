import { Bucket, Storage } from '@google-cloud/storage';
import { fail } from 'assert';
import { expect } from 'chai';
import { stub } from 'sinon';
import { Writable } from 'stream';
import { CloudStorageService } from './cloud-storage.service';
import { TimestampLogService } from './timestamp-log.service';

describe('Testing cloud-storage.service', () => {
    let cloudStorageService: CloudStorageService;
    let drawingList: any[] = [];
    const fileLink = {
        delete: () => {
            drawingList = [];
            return new Promise<any>((resolve) => { resolve(); });
        },
        exists: () => {
            return new Promise<boolean>((resolve) => { resolve(true); });
        },
        createWriteStream: (a: any) => {
            drawingList.push('test');
            return new Writable(a);
        },
        makePublic: () => {
            return new Promise<any>((resolve) => { resolve(); });
        },
    };
    const bucket = {
        name: 'test-bucket',
        getFiles: (a: any) => { return; },
        file: (a: any) => fileLink,
    };
    const storage = {
        bucket: (a: any) => bucket,
    };

    beforeEach(() => {
        cloudStorageService = new CloudStorageService(new TimestampLogService());
        // Permet de faire le retrait des capacité cloud
        // tslint:disable-next-line: no-string-literal
        cloudStorageService['bucket'] = bucket as unknown as Bucket;
        // Permet de faire le retrait des capacité cloud
        // tslint:disable-next-line: no-string-literal
        cloudStorageService['storage'] = storage as unknown as Storage;
    });

    it('should be defined', (done) => {
        expect(cloudStorageService);
        done();
    });

    it('#fileExist should return if a file exist', async () => {
        const s = stub(fileLink, 'exists');
        await cloudStorageService.fileExist('test');
        expect(s.callCount).to.greaterThan(0);
        s.restore();
    });

    it('#fileDelete should delete file in the cloud', async () => {
        const s = stub(fileLink, 'delete');
        await cloudStorageService.deleteFile('test');
        expect(s.callCount).to.greaterThan(0);
        s.restore();
    });

    it('should fail if file is null', async () => {
        try {
            await cloudStorageService.uploadFile(null);
            fail();
        } catch (err) {
            expect(err);
        }
    });

    it('should fail if buffer is incorrect', async () => {
        const file: Express.Multer.File = {
            fieldname: 'test',
            mimetype: '',
            buffer: Buffer.alloc(0),
            originalname: 'test',
            encoding: '',
            size: 0,
            destination: '',
            location: '',
            filename: 'test',
            path: 'test',
        };
        try {
            await cloudStorageService.uploadFile(file);
            fail();
        } catch (err) {
            expect(err);
        }
    });
});
