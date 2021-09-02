import { TestBed } from '@angular/core/testing';

import { DrawingService } from '../../drawing/drawing.service';
import { CopyPasteOffsetService } from './copy-paste-offset.service';

describe('CopyPasteOffsetService', () => {
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

  beforeEach(() => {
    const spyDrawingService = jasmine.createSpyObj('DrawingService', ['']);
    TestBed.configureTestingModule({
      providers: [
        { provide: DrawingService, useValue: spyDrawingService },
      ],
    });

    drawingServiceSpy = TestBed.get(DrawingService);
  });

  it('should be created', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    expect(service).toBeTruthy();
  });

  it('#resetPasteOffset should reset de paste offset with x and y equal to 0', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    service.pasteOffset = { x: 10000, y: 1000000 };
    expect(service.pasteOffset).not.toEqual({ x: service.OFFSET_CONST, y: service.OFFSET_CONST });
    service.resetPasteOffset();
    expect(service.pasteOffset).toEqual({ x: 0, y: 0 });
  });

  it('#resetToConstPasteOffset should reset de paste offset with x and y equal to the offset constant', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    service.pasteOffset = { x: 10000, y: 1000000 };
    expect(service.pasteOffset).not.toEqual({ x: service.OFFSET_CONST, y: service.OFFSET_CONST });
    service.resetToConstPasteOffset();
    expect(service.pasteOffset).toEqual({ x: service.OFFSET_CONST, y: service.OFFSET_CONST });
  });

  it('#changePasteOffset should increment the offset with the offset constant', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    drawingServiceSpy.width = 50;
    drawingServiceSpy.height = 60;
    service.offsetInit = { x: 0, y: 0 };

    service.resetPasteOffset();
    expect(service.pasteOffset).toEqual({ x: 0, y: 0 });

    service.changePasteOffset();
    expect(service.pasteOffset).toEqual({ x: service.OFFSET_CONST, y: service.OFFSET_CONST });
  });

  it('#changePasteOffset should set the offset to 0 because x is out of the drawing area', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    drawingServiceSpy.width = 50;
    drawingServiceSpy.height = 60;
    service.offsetInit = { x: 51, y: 5 };

    service.pasteOffset = { x: 51, y: 5 };

    service.changePasteOffset();
    expect(service.pasteOffset).toEqual({ x: 0, y: 0 });
  });

  it('#changePasteOffset should set the offset to 0 because y is out of the drawing area', () => {
    const service: CopyPasteOffsetService = TestBed.get(CopyPasteOffsetService);
    drawingServiceSpy.width = 50;
    drawingServiceSpy.height = 60;
    service.offsetInit = { x: 5, y: 61 };

    service.pasteOffset = { x: 5, y: 61 };

    service.changePasteOffset();
    expect(service.pasteOffset).toEqual({ x: 0, y: 0 });
  });
});
