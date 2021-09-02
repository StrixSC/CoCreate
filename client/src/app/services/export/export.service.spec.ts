
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { RGB } from 'src/app/model/rgb.model';
import { ColorTransformerService } from '../color-transformer/color-transformer.service';
import { DrawingService } from '../drawing/drawing.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;
  let drawingServiceMock: { id: string, width: number, height: number, color: RGB, alpha: number, drawing: SVGElement, saved: boolean };
  let gridServiceSpy: jasmine.SpyObj<GridService>;
  beforeEach(async () => {
    const svgEl: SVGElement = document.createElementNS('svg', 'svg') as SVGElement;
    let spyGridService = jasmine.createSpyObj('GridService', ['showGrid', 'hideGrid']);
    const spyColorTransformer = jasmine.createSpyObj('ColorTransformerService', ['rgb2hex']);
    const spySelectionToolService = jasmine.createSpyObj('SelectionToolService', ['showSelection', 'hideSelection']);
    drawingServiceMock = {
      id: 'id',
      width: 100,
      height: 100,
      color: { r: 10, g: 100, b: 150 },
      alpha: 0.75,
      drawing: svgEl,
      saved: false,
    };
    spyGridService = {
      ...
      spyGridService,
      activateGrid: new FormControl(false),
    };

    TestBed.configureTestingModule({
      providers: [ExportService, { provide: DrawingService, useValue: drawingServiceMock },
        { provide: ColorTransformerService, useValue: spyColorTransformer },
        { provide: GridService, useValue: spyGridService },
        {provide: SelectionToolService, useValue: spySelectionToolService},
      ],
    });
    service = TestBed.get(ExportService);
    gridServiceSpy = TestBed.get(GridService);

  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('#exportAsSvg should call asSvg function from svgSaver', async () => {
    const spy = spyOn(service, 'triggerDownload');
    await service.exportAsSVG();
    expect(spy).toHaveBeenCalled();
  });
  it('#exportToFormat should call exportAsSvg if format is svg', () => {
    const spy = spyOn(service, 'exportAsSVG');
    const format = 'SVG';
    service.exportToFormat(format);
    expect(spy).toHaveBeenCalled();

  });

  it('#exportToFormat should call asImage if format is jpg', () => {
    const spy = spyOn(service, 'asImage');

    const format = 'JPG';
    service.exportToFormat(format);
    expect(spy).toHaveBeenCalled();

  });
  it('#exportToFormat should call asImage if format is png', () => {
    const spy = spyOn(service, 'asImage');

    const format = 'PNG';
    service.exportToFormat(format);
    expect(spy).toHaveBeenCalled();

  });
  it('#exportToFormat should call asBmp if format is bmp', () => {
    const spy = spyOn(service, 'asBMP');

    const format = 'BMP';
    service.exportToFormat(format);
    expect(spy).toHaveBeenCalled();

  });
  it('#exportToFormat should hide then show grid if grid is active', () => {
    gridServiceSpy.activateGrid = new FormControl(true);
    const format = 'BMP';
    const spy = spyOn(gridServiceSpy.activateGrid, 'setValue');
    service.exportToFormat(format);
    expect(spy).toHaveBeenCalledTimes(2);

  });
  it('#triggerDownload should create a new a element to dispatch event', () => {
    const HTMLElements: any = {};
    const newElement = document.createElement('a');
    const spy = spyOn(document, 'createElement').and.callFake((ID: string) => {
      if (!HTMLElements[ID]) {

        HTMLElements[ID] = newElement;
      }
      return HTMLElements[ID];
    });

    service.triggerDownload('mockURI', 'SVG');
    expect(spy).toHaveBeenCalled();
  });

  it('#asImage should create a canvas, load an image, then call triggerDownload', async () => {
    const HTMLElements: any = {};

    const newElement = document.createElement('canvas');
    const spy = spyOn(document, 'createElement').and.callFake((ID: string) => {
      if (!HTMLElements[ID]) {

        HTMLElements[ID] = newElement;
      }
      return HTMLElements[ID];
    });
    const windowSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('assets/img/image1.png');
    service.asImage('SVG', 'image/jpeg');

    expect(spy).toHaveBeenCalled();
    expect(windowSpy).toHaveBeenCalled();

  });

  it('#asBMP should create a canvas,load an image, then call triggerDownload', async () => {
    const HTMLElements: any = {};

    const newElement = document.createElement('canvas');
    const spy = spyOn(document, 'createElement').and.callFake((ID: string) => {
      if (!HTMLElements[ID]) {

        HTMLElements[ID] = newElement;
      }
      return HTMLElements[ID];
    });
    const windowSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('assets/img/image1.png');

    service.asBMP();

    expect(spy).toHaveBeenCalled();
    expect(windowSpy).toHaveBeenCalled();

  });

});
