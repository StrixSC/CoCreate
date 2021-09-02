import { expect } from 'chai';
import { MulterProviderService } from './multer-provider.service';

describe('Testing multer-provider.service', () => {
    it('should be defined', (done) => {
        const multerProvider: MulterProviderService = new MulterProviderService();
        expect(multerProvider);
        done();
    });
});
