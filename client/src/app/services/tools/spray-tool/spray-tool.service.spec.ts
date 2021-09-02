import { Renderer2 } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { SprayCommand } from './spray-command';
import { SprayToolService } from './spray-tool.service';

describe('SprayToolService', () => {
  let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let service: SprayToolService;

  beforeEach(() => {
    rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'apSpraydChild', 'setStyle']);
    const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
    spyDrawingService = {
      ...spyDrawingService,
      renderer: rendererSpy,
    };
    TestBed.configureTestingModule({
      providers: [RendererProviderService,
        { provide: DrawingService, useValue: spyDrawingService },
        { provide: OffsetManagerService, useValue: spyOffset },
        {
          provide: ToolsColorService, useValue: {
            primaryColorString: 'rgb(100,200,50)', primaryAlpha: 0.6,
            secondaryColorString: 'rgb(200,50,100)', secondaryAlpha: 0.3,
          },
        },
      ],
    });
    drawingServiceSpy = TestBed.get(DrawingService);
    offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
    drawingServiceSpy.addObject.and.returnValue(1);
    service = TestBed.get(SprayToolService);
  });

  afterEach(() => {
    service.dropTool();
  });

  it('should be created', () => {

    expect(service).toBeTruthy();
  });

  it('should create spray on pressed ', fakeAsync(() => {
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
    service.parameters.patchValue({ emissionPerSecond: 4 });
    service.parameters.patchValue({ circleRadius: 6 });
    // generer des  valeurs aleatoires a 0 pour conserver les points au centre
    const spyMath = spyOn(Math, 'random').and.returnValue(0);
    const mouseEvent = new MouseEvent('mousedown', { button: 0 });
    service.onPressed(mouseEvent);
    tick(11); /// emet un signal apres un delai de 11 ms
    const sprayCommand: SprayCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as SprayCommand;
    expect(sprayCommand).toBeDefined();
    const spray = sprayCommand.getSpray() as SVGGElement;
    expect(spray).toBeDefined();
    expect(spray.childNodes.length).toEqual(4);
    /// verifier si les attributs des enfants ont les bonnes valeurs
    expect(spyMath).toHaveBeenCalled();
    const circle = spray.children[0];
    expect(circle.getAttribute('cx')).toEqual('4');
    expect(circle.getAttribute('cy')).toEqual('4');
    expect(circle.getAttribute('r')).toEqual('6');

  }));

  it('should create spray onPressed if bouton is 2', fakeAsync(() => {
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
    /// appel de la fonction onPresssed avec le bouton 2
    const mouseEvent = new MouseEvent('mousedown', { button: 2 });
    service.onPressed(mouseEvent);
    tick(12);
    const sprayCommand: SprayCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as SprayCommand;
    expect(sprayCommand).toBeDefined();
  }));

  it('should change mouseOffset onMove', fakeAsync(() => {
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
    const mouseMove = new MouseEvent('mousemove');
    service.onMove(mouseMove);
    // Acceder a un attribut priver
    // tslint:disable-next-line: no-string-literal
    expect(service['offset']).toEqual({ x: 4, y: 4 });
  }));

  it('should do nothing ', fakeAsync(() => {
    service.pickupTool();
    expect(service.onRelease(new MouseEvent('mouseup', { button: 0 }))).toBeUndefined();
    expect(service.onKeyDown(new KeyboardEvent('keydown'))).toBeUndefined();
    expect(service.onKeyUp(new KeyboardEvent('keyup'))).toBeUndefined();
    const moveEvent = new MouseEvent('mousemove', { movementX: 2, movementY: 2 });
    expect(service.onMove(moveEvent)).toBeUndefined();
  }));
  it('should do nothing ', fakeAsync(() => {
    service.dropTool();
    expect(service.onRelease(new MouseEvent('mouseup', { button: 0 }))).toBeUndefined();
    expect(service.onKeyDown(new KeyboardEvent('keydown'))).toBeUndefined();
    expect(service.onKeyUp(new KeyboardEvent('keyup'))).toBeUndefined();
    const moveEvent = new MouseEvent('mousemove', { movementX: 2, movementY: 2 });
    expect(service.onMove(moveEvent)).toBeUndefined();
  }));

  it('should not create spray because bouton is 1 ', fakeAsync(() => {
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
    const mouseEvent = new MouseEvent('mousedown', { button: 1 });
    service.onPressed(mouseEvent);
    const sprayCommand: SprayCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as SprayCommand;
    expect(sprayCommand).not.toBeDefined();

  }));

  it('should not create spray because form control is not valid', fakeAsync(() => {
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
    service.parameters.patchValue({ emissionPerSecond: 0 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    tick(10);
    const sprayCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as SprayCommand;
    expect(sprayCommand).not.toBeDefined();
  }));

});
