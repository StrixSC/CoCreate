import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { OffsetManagerService } from '../offset-manager/offset-manager.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { MagnetismService } from './magnetism.service';

describe('MangnetismService', () => {
  let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
  let gridServiceSpy: jasmine.SpyObj<GridService>;

  beforeEach(() => {
    const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
    const spyGrid = jasmine.createSpyObj('GridService', ['activateGrid', 'sizeCell', 'activateMagnetism']);
    TestBed.configureTestingModule({
      providers: [
        { provide: OffsetManagerService, useValue: spyOffset },
        { provide: GridService, useValue: spyGrid },
      ],
    });
    offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
    gridServiceSpy = TestBed.get(GridService);
    gridServiceSpy.sizeCell = new FormControl(100);
    gridServiceSpy.activateMagnetism = new FormControl(true);

  });

  it('should be created', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    expect(service).toBeTruthy();
  });
  it('should return the closest corner of my grid', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    const result = service.offsetCoordMagnetismFromPoint(176, 176);
    expect(result).toEqual({ x: 200, y: 200 });
  });

  it('should return the closest corner of my grid', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    const result = service.offsetCoordMagnetismFromPoint(210, 210);
    expect(result).toEqual({ x: 200, y: 200 });
  });

  it('should return the frist movement for selection when first time is true', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    const mouseEvent: MouseEvent = new MouseEvent('mousedown');
    const result = service.movementMagnetism(mouseEvent, 120, 176, true);
    expect(result).toEqual({ movementX: -20, movementY: 24 });
  });

  it('should return the following movement', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    const mouseEvent: MouseEvent = new MouseEvent('mousemove', { movementX: 60, movementY: 0 });
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 180, y: 176 });
    service.movementMagnetism(mouseEvent, 120, 176, true);
    const result = service.movementMagnetism(mouseEvent, 120, 176, false);
    expect(result).toEqual({ movementX: 100, movementY: 0 });
  });

  it('should do nothing if values of total movement is not above half the cell size value', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    const mouseEvent: MouseEvent = new MouseEvent('mousemove', { movementX: 0, movementY: -30 });
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 40, y: 85 });
    const result = service.movementMagnetism(mouseEvent, 120, 176, false);
    expect(result).toEqual({ movementX: 0, movementY: 0 });
  });

  it('should activateMagnetism when toggleMagnetism is called', () => {
    const service: MagnetismService = TestBed.get(MagnetismService);
    service.toggleMagnetism();
    expect(gridServiceSpy.activateMagnetism.value).toEqual(false);
  });

});
