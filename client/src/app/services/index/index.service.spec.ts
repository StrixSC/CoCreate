import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ShortcutClavier,
  WelcomeMessage
} from '../../../../../common/communication/message';
import { IndexService } from './index.service';

describe('IndexService', () => {
  let httpMock: HttpTestingController;
  let service: IndexService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IndexService],
    });
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(IndexService);
  });
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('#basicGet should work', () => {
  //   const dummyMessage: Message = {
  //     title: 'dummyTitle',
  //     body: 'dummyBody',
  //   };
  //   service.basicGet().subscribe((message: Message) => {
  //     expect(message).toEqual(dummyMessage);
  //   });

  //   const req = httpMock.expectOne(`${service.BASE_URL}`);
  //   expect(req.request.method).toBe('GET');
  //   req.flush(dummyMessage);
  // });

  it('#welcomeGet should work', () => {
    const dummyWelcomeMessage: WelcomeMessage = {
      body: 'dummyTitle',
      end: 'dummyBody',
    };
    service.welcomeGet().subscribe((message: WelcomeMessage) => {
      expect(message).toEqual(dummyWelcomeMessage);
    });

    const req = httpMock.expectOne(`${service.BASE_URL}/text`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyWelcomeMessage);
  });

  it('#aideGet should work', () => {
    const dummyShortcutClavier: ShortcutClavier = {
      O: '',
      S: '',
      G: '',
      E: '',
      X: '',
      C: '',
      V: '',
      D: '',
      Sup: '',
      A: '',
      Z: '',
      ShiftZ: '',
      Cray: '',
      W: '',
      P: '',
      Y: '',
      Aer: '',
      Rec: '',
      Ell: '',
      Poly: '',
      L: '',
      T: '',
      R: '',
      B: '',
      Eff: '',
      I: '',
      Sel: '',
      Gri: '',
      M: '',
      Aug: '',
      Dim: '',
    };
    service.aideGet().subscribe((message: ShortcutClavier) => {
      expect(message).toEqual(dummyShortcutClavier);
    });

    const req = httpMock.expectOne(`${service.BASE_URL}/text`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyShortcutClavier);
  });

  it('#handleError should work', () => {
    // const dummyWelcomeMessage: WelcomeMessage = {
    //   body: 'dummyTitle',
    //   end: 'dummyBody',
    // };
    service.welcomeGet().subscribe((message: WelcomeMessage) => {
      expect(message).toEqual({ body: 'Erreur de lecture serveur', end: 'Erreur de lecture serveur' });
    });

    const req = httpMock.expectOne(`${service.BASE_URL}/text`);
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent(''));
  });
});
