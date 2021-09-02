import { injectable } from 'inversify';
import { Tag } from '../../../common/communication/drawing';

@injectable()
export class TagServiceMock {

    getAllTags(): Promise<Tag[]> {
        return new Promise<Tag[]>((resolve) => resolve([{
            name: 'name',
            numberOfUses: 0,
        }]));
    }
}

// tslint:disable-next-line: max-classes-per-file
@injectable()
export class TagServiceMockFail {
    getAllTags(): Promise<Tag[]> {
        return new Promise<Tag[]>((_, reject) => reject('error'));
    }
}
