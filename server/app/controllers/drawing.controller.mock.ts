import { injectable } from 'inversify';
import { Drawing } from '../../../common/communication/drawing';

@injectable()
export class DrawingServiceMock {
    getAllDrawings(): Promise<Drawing[]> {
        return new Promise<Drawing[]>((resolve) => resolve([{
            name: 'name',
            tags: ['tag1'],
            createdAt: new Date(),
            fileName: 'file.svg',
            path: 'svg/svg',
        }]));
    }

    setDrawing(drawing: Drawing): Promise<Drawing> {
        return new Promise<Drawing>((resolve) => resolve(drawing));
    }

    getOneDrawing(fileName: string): Promise<Drawing | null> {
        return new Promise<Drawing | null>((resolve) => resolve({
            name: 'name',
            tags: ['tag1'],
            createdAt: new Date(),
            fileName: 'file.svg',
            path: 'svg/svg',
        }));
    }

    deleteDrawing(fileName: string): Promise<void> {
        return new Promise<void>((resolve) => resolve());
    }
}

// tslint:disable-next-line: max-classes-per-file
@injectable()
export class DrawingServiceMockFail {
    getAllDrawings(): Promise<Drawing[]> {
        return new Promise<Drawing[]>((_, reject) => reject('error'));
    }

    getOneDrawing(fileName: string): Promise<Drawing | null> {
        return new Promise<Drawing | null>((resolve) => resolve(null));
    }
}

// tslint:disable-next-line: max-classes-per-file
@injectable()
export class DrawingServiceMockFailGet {
    getOneDrawing(fileName: string): Promise<Drawing | null> {
        return new Promise<Drawing | null>((_, reject) => reject(null));
    }
}

// tslint:disable-next-line: max-classes-per-file
@injectable()
export class DrawingServiceMockFailDelete {
    getOneDrawing(fileName: string): Promise<Drawing | null> {
        return new Promise<Drawing | null>((resolve) => resolve({
            name: 'name',
            tags: ['tag1'],
            createdAt: new Date(),
            fileName: 'file.svg',
            path: 'svg/svg',
        }));
    }

    deleteDrawing(fileName: string): Promise<void> {
        return new Promise<void>((_, reject) => reject());
    }

}
