import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Drawing } from '../../../../../common/communication/drawing';
import { DrawingRequestService } from './drawing-request.service';

describe('SaveRequestService', () => {
    let injector: TestBed;
    let service: DrawingRequestService;
    let httpMock: HttpTestingController;

    const mockDrawing: Drawing = {
        name: 'mock',
        tags: ['tag1', 'tag2'],
        path: '',
        createdAt: new Date(),
        fileName: 'mockfile.svg',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DrawingRequestService],
        });
        injector = getTestBed();
        service = injector.get(DrawingRequestService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#addDrawing should return http post', () => {
        service.addDrawing(new Blob([''], { type: 'text/html' }), 'test', ['test']).subscribe();
        const req = httpMock.expectOne(environment.serverURL + '/drawings');
        expect(req.request.method).toBe('POST');
    });

    it('#openDrawing should return http get', () => {
        service.openDrawing(mockDrawing.path).subscribe();
        const req = httpMock.expectOne(mockDrawing.path);
        expect(req.request.method).toBe('GET');
    });

    it('#deleteDrawing should return http delete', () => {
        service.deleteDrawing(mockDrawing).subscribe();
        const req = httpMock.expectOne(`${environment.serverURL}/drawings/${mockDrawing.fileName}`);
        expect(req.request.method).toBe('DELETE');
    });

    afterEach(() => {
        httpMock.verify();
    });
});
