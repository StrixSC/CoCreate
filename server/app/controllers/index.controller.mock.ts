import { injectable } from 'inversify';
import { WelcomeMessage } from '../../../common/communication/message';

@injectable()
export class IndexServiceMock {
    getTextRessource(pathName: string): WelcomeMessage {
        return {
            body: 'body',
            end: 'end',
        };
    }
}
