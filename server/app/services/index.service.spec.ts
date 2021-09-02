import { expect } from 'chai';
import { IndexService } from './index.service';

describe('Testing index.service', () => {
    it('should return text resources', (done) => {
        const indexService = new IndexService();
        const pathText = '/../res/text/welcome_text2.json';
        const result = indexService.getTextRessource(pathText);
        expect(result.body);
        done();
    });
});
