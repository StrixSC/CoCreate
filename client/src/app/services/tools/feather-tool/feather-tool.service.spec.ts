import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { FEATHER_CONSTANTS } from '../tools-constants';
import { FeatherCommand } from './feather-command';
import { ALT_ROTATION_ANGLE_INTERVAL, DEFAULT_ROTATION_ANGLE_INTERVAL, FeatherToolService } from './feather-tool.service';

describe('FeatherToolService', () => {

  const mockPrimaryColorString = 'rgb(100,200,50)';
  const mockSecondaryColorString = 'rgb(200,50,100)';
  const mockPrimaryAlpha = 0.6;
  const mockSecondaryAlpha = 0.3;
  let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;

  rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
  const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
  let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
  spyDrawingService = {
    ...spyDrawingService,
    renderer: rendererSpy,
};

  beforeEach(() => {
    TestBed.configureTestingModule({

      providers: [RendererProviderService, FeatherToolService,
        { provide: DrawingService, useValue: spyDrawingService },
        { provide: OffsetManagerService, useValue: spyOffset },
        {
          provide: ToolsColorService, useValue: {
            primaryColorString: mockPrimaryColorString, primaryAlpha: mockPrimaryAlpha,
            secondaryColorString: mockSecondaryColorString, secondaryAlpha: mockSecondaryAlpha,
          },
        }],
    });
    drawingServiceSpy = TestBed.get(DrawingService);
    offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
    drawingServiceSpy.addObject.and.returnValue(1);
  });

  it('should be created', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    expect(service).toBeTruthy();
  });
  it('should register an event listener on mouse click', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    const spy = spyOn(service, 'registerEventListenerOnScroll');

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

    service.onPressed(new MouseEvent('mousedown', {button: 0}));
    expect(spy).toHaveBeenCalled();

  });
  it('should create featherCommand with primary attributes on left pressed', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    const offset = { x: 10, y: 12 };
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);

    service.onPressed(new MouseEvent('mousedown', {button: 0}));
    const command: FeatherCommand  = service.onRelease() as FeatherCommand  ;
    expect(command).toBeDefined();
    // disabled pour tester l'etat des attributs prives
    /*  tslint:disable:disable-next-line: no-string-literal */
    expect(command['featherAttributes']).toEqual(jasmine.objectContaining({
      pointsList: [offset],
      strokeWidth: FEATHER_CONSTANTS.INITIAL_FEATHER_LENGTH,
      rotationAngle: FEATHER_CONSTANTS.INITIAL_ROTATION_ANGLE,
      fill: mockPrimaryColorString,
      stroke: mockPrimaryColorString,
      fillOpacity: 'none',
      strokeOpacity: mockPrimaryAlpha.toString(),
    }));

  });
  it('should create featherCommand with secondary attributes on right pressed', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    const offset = { x: 10, y: 12 };
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);

    service.onPressed(new MouseEvent('mousedown', {button: 2}));
    const command: FeatherCommand  = service.onRelease() as FeatherCommand  ;
    expect(command).toBeDefined();
    expect(command['featherAttributes']).toEqual(jasmine.objectContaining({
      pointsList: [offset],
      strokeWidth: FEATHER_CONSTANTS.INITIAL_FEATHER_LENGTH,
      rotationAngle: FEATHER_CONSTANTS.INITIAL_ROTATION_ANGLE,
      fill: mockSecondaryColorString,
      stroke: mockSecondaryColorString,
      fillOpacity: 'none',
      strokeOpacity: mockSecondaryAlpha.toString(),
    }));

  });
  it('should remove an event listener and reset values on mouse release', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    service.addBorderPoints({x: 1, y: 2});
    const spy = spyOn(service, 'removeEventListenerOnScroll');

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

    service.onRelease();
    expect(spy).toHaveBeenCalled();

    expect(service['firstPoints']).toEqual([]);
    expect(service['secondPoints']).toEqual([]);
    expect(service['secondPoints']).toEqual([]);
    expect(service['visitedPoints'].size).toEqual(0);
    expect(service['directionChangeCount']).toEqual(0);
    expect(service['featherCommand']).toBeUndefined();
    expect(service['feather']).toBeNull();

  });
  it('should reset directionChangeCount and visitedPoints on collision', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', {button: 2}));
    service.addBorderPoints({ x: 10, y: 12 });

    expect(service['visitedPoints'].size).toEqual(2); // les deux points restants sont ceux du dernier point ajoutes
    expect(service['directionChangeCount']).toEqual(0);

  });
  it('should reset directionChangeCount, visitedPoints and current quadrant on directionChange', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    service['directionChangeCount'] = FEATHER_CONSTANTS.MAX_DIRECTION_CHANGE;
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', {button: 2}));

    service.onMove(new MouseEvent('mousemove', { movementX: 2, movementY: 2 }));
    expect(service['visitedPoints'].size).toEqual(2); // les deux points restants sont ceux du dernier point ajoutes
    expect(service['directionChangeCount']).toEqual(0);
    expect(service['currentPathDirectionQuadrant']).toEqual(1);

  });
  it('should update path on pressed', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    const spy = spyOn(service, 'updatePath');

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

    service.onPressed(new MouseEvent('mousedown', {button: 2}));
    expect(spy).toHaveBeenCalled();
  });
  it('should increment the directionChangeCount if moving in different quadrant', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });

    service.onMove(new MouseEvent('mousemove', { movementX: 2, movementY: 2 }));
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 2, y: 2 });

    service.onMove(new MouseEvent('mousemove', { movementX: -2, movementY: 2 }));
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 3, y: 3 });

    service.onMove(new MouseEvent('mousemove', { movementX: 2, movementY: -2 }));
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });

    service.onMove(new MouseEvent('mousemove', { movementX: -2, movementY: -2 }));
    expect(service['directionChangeCount']).toEqual(1);
  });
  it('should not create feather if button is not 0 or 2', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    service.onPressed(new MouseEvent('mousedown', { button: 3 }));
    service.onMove(new MouseEvent('mousemove'));
    service.onKeyUp();
    service.onKeyDown();
    service.pickupTool();
    service.dropTool();
    const command = service.onRelease();
    expect(command).toBeUndefined();
  });
  it('should set alternative rotation interval on alt key down and up', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));

    window.dispatchEvent(new KeyboardEvent('keydown', {altKey: true}));

    expect(service['currentRotationInterval']).toEqual(ALT_ROTATION_ANGLE_INTERVAL);
    window.dispatchEvent(new KeyboardEvent('keyup', {key: KeyCodes.alt}));

    expect(service['currentRotationInterval']).toEqual(DEFAULT_ROTATION_ANGLE_INTERVAL);

  });
  it('should not set alternative rotation interval if wrong keys are pressed', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));

    window.dispatchEvent(new KeyboardEvent('keydown', {altKey: false}));

    expect(service['currentRotationInterval']).not.toEqual(ALT_ROTATION_ANGLE_INTERVAL);

    service['currentRotationInterval'] = ALT_ROTATION_ANGLE_INTERVAL;
    window.dispatchEvent(new KeyboardEvent('keyup', {key: KeyCodes.b}));
    expect(service['currentRotationInterval']).not.toEqual(DEFAULT_ROTATION_ANGLE_INTERVAL);

  });
  it('should modify rotation angle interval by 15 on default wheel scroll', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));

    window.dispatchEvent(new WheelEvent('wheel', {deltaY: 1}));

    expect(service['rotationAngle'].value).toEqual(15);

    window.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    expect(service['rotationAngle'].value).toEqual(0);
    window.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    expect(service['rotationAngle'].value).toEqual(345);

  });

  it('should modify rotation angle interval by 1 on alt wheel scroll', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    window.dispatchEvent(new KeyboardEvent('keydown', {altKey: true}));

    window.dispatchEvent(new WheelEvent('wheel', {deltaY: 1}));

    expect(service['rotationAngle'].value).toEqual(1);

    window.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    expect(service['rotationAngle'].value).toEqual(0);
    window.dispatchEvent(new WheelEvent('wheel', {deltaY: -1}));
    expect(service['rotationAngle'].value).toEqual(359);

  });
  it('should not create feather command if strokewidth or rotation angle is invalid on press', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);

    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service['rotationAngle'].setValue(9999);
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));

    const command: FeatherCommand  = service.onRelease() as FeatherCommand  ;
    expect(command).toBeUndefined();
  });

  it('should not add border points if featherCommand does not exist', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    const spy = spyOn(service, 'addBorderPoints');
    service.updatePath(new MouseEvent('mousedown', {button: 0}));

    expect(spy).not.toHaveBeenCalled();
  });
  it('should not increment directionChange if movement is in the same quadrant', () => {
    const service: FeatherToolService = TestBed.get(FeatherToolService);
    service['currentPathDirectionQuadrant'] = 1;
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0, movementX: 1, movementY: 1 }));
    expect(service['directionChangeCount']).toEqual(0);

  });
});
