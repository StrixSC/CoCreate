import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { RGB } from 'src/app/model/rgb.model';
import { DrawingService } from '../drawing/drawing.service';
import { SaveDrawingDialogService } from './save-drawing-dialog.service';

describe('SaveDrawingDialogService', () => {
  let injector: TestBed;
  let service: SaveDrawingDialogService;
  let drawingServiceMock: { id: string, width: number, height: number, color: RGB, alpha: number, drawing: SVGElement, saved: boolean };

  beforeEach(() => {
    const svgEl: SVGElement = document.createElementNS('svg', 'svg') as SVGElement;
    drawingServiceMock = {
      id: 'id',
      width: 100,
      height: 100,
      color: { r: 10, g: 100, b: 150 },
      alpha: 0.75,
      drawing: svgEl,
      saved: false,
    };
    TestBed.configureTestingModule({
      imports: [MaterialModules, BrowserAnimationsModule],
      providers: [SaveDrawingDialogService,
        { provide: DrawingService, useValue: drawingServiceMock },
      ],
    });
    injector = getTestBed();
    service = injector.get(SaveDrawingDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#openDialog should not open the modal window if the conditions are not met', () => {
    const spy = spyOn(service.dialog, 'open');
    const drawingServiceSpy = injector.get(DrawingService);
    drawingServiceSpy.isSaved = true;
    service.openDialog();
    expect(spy).not.toHaveBeenCalled();
  });

  it('#openDialog should open the modal window', () => {
    const spy = spyOn(service.dialog, 'open');
    const drawingServiceSpy = injector.get(DrawingService);
    drawingServiceSpy.isSaved = false;
    drawingServiceSpy.isCreated = true;
    service.openDialog();
    expect(spy).toHaveBeenCalled();
  });
});
