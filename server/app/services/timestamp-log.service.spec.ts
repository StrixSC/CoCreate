import { expect } from 'chai';
import { TimestampLogService } from './timestamp-log.service';

describe('Testing timestamp-log.service', () => {

    it('should be defined', (done) => {
        const timestampLog = new TimestampLogService();
        timestampLog.log('message');
        expect(timestampLog);
        done();
    });
});
