import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { GetDrawingRequestService } from './get-drawing-request.service';

describe('GetDrawingRequestService', () => {
  let injector: TestBed;
  let service: GetDrawingRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetDrawingRequestService],
    });
    injector = getTestBed();
    service = injector.get(GetDrawingRequestService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send request to getDrawing',  () => {
    service.getDrawings().subscribe((data) => {
      expect(data).toBeDefined();
    });
    const req = httpMock.expectOne(`${environment.serverURL}/drawings/`);
    expect(req.request.method).toBe('GET');

  });
  it('should return empty list if an error is thrown', () => {
    service.getDrawings().subscribe((data) => {
      expect(data).toEqual(([]));
    });
    const req = httpMock.expectOne(`${environment.serverURL}/drawings/`);
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent(''));

  });

  afterEach(() => {
    httpMock.verify();

  });
});
