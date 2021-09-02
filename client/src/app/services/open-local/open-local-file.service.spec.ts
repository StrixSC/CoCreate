import { TestBed } from '@angular/core/testing';

import { OpenLocalService } from './open-local-file.service';

describe('OpenLocalService', () => {
  let fileReaderSpy: jasmine.SpyObj<FileReader>;
  let service: OpenLocalService;

  beforeEach(() => {
    const spyFileReader = jasmine.createSpyObj('FileReader', ['readAsText', 'onload', 'onerror']);

    TestBed.configureTestingModule({
      providers: [{ provide: FileReader, useValue: spyFileReader }],
    });

    service = TestBed.get(OpenLocalService);
    fileReaderSpy = TestBed.get(FileReader);
    fileReaderSpy.onload = () => { return; };
    fileReaderSpy.onerror = () => { return; };
    fileReaderSpy.readAsText.and.returnValue();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('#handleFile should read the file as text and define an observable', () => {
    const blob = new Blob([''], { type: 'text/html' });

    const file = blob as File;
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    };
    const result = service.handleFile(fileList);
    expect(result).toBeDefined();
  });

  it('#handleReaderLoad should read complete the suscriber', () => {
    const suscriberSpy = jasmine.createSpyObj('Suscriber', ['next', 'complete']);
    service.handleReaderLoad(suscriberSpy, 'mockResult');

    expect(suscriberSpy.next).toHaveBeenCalled();
    expect(suscriberSpy.complete).toHaveBeenCalled();

  });

  it('#handleReaderError should call error on the suscriber', () => {
    const suscriberSpy = jasmine.createSpyObj('Suscriber', ['error']);
    const errorSpy = jasmine.createSpyObj('ProgressEVENT', ['']);
    service.handleReaderError(suscriberSpy, errorSpy);

    expect(suscriberSpy.error).toHaveBeenCalled();

  });
});
