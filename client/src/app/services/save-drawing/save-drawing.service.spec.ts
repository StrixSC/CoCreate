import { getTestBed, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { RGB } from 'src/app/model/rgb.model';
import { DrawingRequestService } from '../drawing-request/drawing-request.service';
import { DrawingService } from '../drawing/drawing.service';
import { ErrorMessageService } from '../error-message/error-message.service';
import { ExportService } from '../export/export.service';
import { RendererProviderService } from '../renderer-provider/renderer-provider.service';
import { TagService } from '../tag/tag.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { SaveDrawingService } from './save-drawing.service';

describe('SaveDrawingService', () => {
  let injector: TestBed;
  let service: SaveDrawingService;
  let drawingServiceMock: { id: string, width: number, height: number, color: RGB, alpha: number, drawing: SVGElement, saved: boolean };
  let errorMessageSpy: jasmine.SpyObj<ErrorMessageService>;
  let gridServiceSpy: jasmine.SpyObj<GridService>;
  let saveRequestSpy: jasmine.SpyObj<DrawingRequestService>;
  let exportServiceSpy: jasmine.SpyObj<ExportService>;

  beforeEach(() => {
    const spyErrorMessage = jasmine.createSpyObj('ErrorMessage', ['showError']);
    let spyGridService = jasmine.createSpyObj('GridService', ['showGrid', 'hideGrid']);
    const spySaveRequestService: jasmine.Spy = jasmine.createSpyObj('SaveRequestService', ['addDrawing']);
    const spyExportService: jasmine.Spy = jasmine.createSpyObj('ExportService', ['exportAsSVG']);
    const spySelectionToolService = jasmine.createSpyObj('SelectionToolService', ['showSelection', 'hideSelection']);

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

    spyGridService = {
      ...
      spyGridService,
      activateGrid: new FormControl(false),
    };
    TestBed.configureTestingModule({
      providers: [SaveDrawingService,
        { provide: DrawingRequestService, useValue: spySaveRequestService },
        { provide: DrawingService, useValue: drawingServiceMock },
        { provide: ErrorMessageService, useValue: spyErrorMessage },
        { provide: GridService, useValue: spyGridService },
        { provide: ExportService, useValue: spyExportService },
        { provide: SelectionToolService, useValue: spySelectionToolService },

        {
          provide: TagService, useClass: class {
            retrieveTags() {
              return of(['tag1', 'tag2']);
            }
          },
        }],
    });
    injector = getTestBed();
    service = injector.get(SaveDrawingService);
    const rendererProviderService = injector.get(RendererProviderService);
    const drawingService = injector.get(DrawingService);
    drawingService.drawing = rendererProviderService.renderer.createElement('svg', 'svg');
    errorMessageSpy = injector.get(ErrorMessageService);
    gridServiceSpy = injector.get(GridService);
    saveRequestSpy = injector.get(DrawingRequestService);
    exportServiceSpy = injector.get(ExportService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all tags', () => {
    expect(service.getAllTags()).toEqual(['tag1', 'tag2']);
  });

  it('#reset should reset the values for the save drawing service', () => {
    service.reset();
    expect(service.tagCtrl.untouched).toBeTruthy();
    expect(service.nameCtrl.untouched).toBeTruthy();
    expect(service.tags.length).toEqual(0);
  });

  it('#add should not add a tag in the list of tags when the tag exist', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'tag1';
    const value = 'tag1';
    service.tags = ['tag1'];
    const intialLength: number = service.tags.length;
    service.allTags = ['tag1'];
    service.tagCtrl.setValue('tag1');
    service.add({ input, value }, false);
    expect(service.tags.length).toEqual(intialLength);
  });

  it('#add should add a tag in the list of tags', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, false);
    expect(service.tagCtrl.value).toBeNull();
    expect(service.tags.includes(value.trim())).toBeTruthy();
    expect(input.value).toEqual('');
  });

  it('#add should add a tag in the list of tags without changing input', () => {
    const input: HTMLInputElement = document.getElementById('input') as HTMLInputElement;

    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, false);
    expect(service.tagCtrl.value).toBeNull();
    expect(service.tags.includes(value.trim())).toBeTruthy();
  });

  it('#add should not add a tag in the list of tags if value is null', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = String(null);
    service.tagCtrl.setValue('val');
    spyOn(service.tags, 'push');
    service.add({ input, value }, true);
    expect(service.tags.push).not.toHaveBeenCalled();
  });

  it('#add should not add a tag in the list of tags if matAutoCompletIsOpen', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, true);
    expect(service.tagCtrl.value).not.toBeNull();
    expect(service.tags.includes(value.trim())).toBeFalsy();
    expect(input.value).toEqual('VALUE');
  });

  it('#remove should remove the tag if it exist', () => {
    service.tags = ['tag1', 'tag2'];
    service.remove('tag2');
    expect(service.tags).toEqual(['tag1']);
  });

  it('#remove should not remove the tag if it doesnt exist', () => {
    service.tags = ['tag1', 'tag2'];
    service.remove('tag3');
    expect(service.tags).toEqual(['tag1', 'tag2']);
  });

  it('#save should save the drawing if there is no error', async () => {
    saveRequestSpy.addDrawing.and.returnValue(of({}));
    const res: boolean = await service.save();
    expect(res).toBeTruthy();
  });

  it('#save should not save the drawing if there is an error', async () => {
    saveRequestSpy.addDrawing.and.throwError('ERROR');
    const res: boolean = await service.save();
    expect(errorMessageSpy.showError).toHaveBeenCalled();
    expect(res).toBeFalsy();
  });

  it('#save should save the drawing without the grid', async () => {
    gridServiceSpy.activateGrid.setValue(true);
    saveRequestSpy.addDrawing.and.returnValue(of({}));
    const spy = spyOn(gridServiceSpy.activateGrid, 'setValue');
    await service.save();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('#selected should push the tag value', () => {
    service.selected('Tag8');
    expect(service.tags.includes('Tag8')).toBeTruthy();
    expect(service.tagCtrl.value).toBeNull();
  });

  it('#filter should return the tags filtered to match string', () => {
    expect(service.filter('Tag1')).toEqual(['tag1']);
  });

  it('should change the filtered tags', () => {
    service.filteredTags.subscribe((value) => {
      expect(value).toBeTruthy();
    });
    service.tagCtrl.patchValue('tag1');
  });
  it('#saveLocally should save locally the drawing if there is no error and grid will be hidden and then visible', async () => {
    exportServiceSpy.exportAsSVG.and.returnValue(new Promise<void>((resolve) => resolve()));
    gridServiceSpy.activateGrid.patchValue(true);
    const spy = spyOn(gridServiceSpy.activateGrid, 'setValue');
    const res: boolean = await service.saveLocally();
    expect(spy).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });

  it('#saveLocally should save locally the drawing if there is no error but grid will be shown', async () => {
    exportServiceSpy.exportAsSVG.and.returnValue(new Promise<void>((resolve) => resolve()));
    gridServiceSpy.activateGrid.patchValue(false);
    const spy = spyOn(gridServiceSpy.activateGrid, 'setValue');
    const res: boolean = await service.saveLocally();
    expect(spy).toHaveBeenCalled();
    expect(res).toBeTruthy();
  });

  it('#saveLocally should return false is an error', async () => {
    exportServiceSpy.exportAsSVG.and.throwError('ERROR');
    const res: boolean = await service.saveLocally();
    expect(res).not.toBeTruthy();
  });
});
