import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { GridService } from '../grid-tool/grid.service';
import { PenCommand } from './pen-command';
import { PenToolService } from './pen-tool.service';

describe('PenToolService', () => {
  let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;

  beforeEach(() => {
    rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
    const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent', 'movementMagnetism']);
    const spyGrid = jasmine.createSpyObj('GridService', ['activateMagnetism']);
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
    spyDrawingService = {
      ...spyDrawingService,
      renderer: rendererSpy,
    };
    TestBed.configureTestingModule({
      providers: [RendererProviderService,
        { provide: GridService, useValue: spyGrid },
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
  });

  it('should be created', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    expect(service).toBeTruthy();
  });

  it('should create a dot on mouse press 0', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    const command: PenCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PenCommand;
    expect(command).toBeDefined();
    const pen = command.getDot() as SVGCircleElement;
    expect(pen).toBeDefined();
    expect(pen.getAttribute('cx')).toEqual('10');
    expect(pen.getAttribute('cy')).toEqual('12');
    expect(pen.getAttribute('r')).toEqual('4px');
    expect(pen.style.fill).toEqual('rgb(100, 200, 50)');
    expect(pen.style.fillOpacity).toEqual('0.6');
  });

  it('should create dot on mouse button 2', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 2 }));
    const command: PenCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as PenCommand;
    expect(command).toBeDefined();
    const pen = command.getDot() as SVGCircleElement;
    expect(pen).toBeDefined();
    expect(pen.getAttribute('cx')).toEqual('10');
    expect(pen.getAttribute('cy')).toEqual('12');
    expect(pen.getAttribute('r')).toEqual('4px');
    expect(pen.style.fill).toEqual('rgb(200, 50, 100)');
    expect(pen.style.fillOpacity).toEqual('0.3');
  });

  it('should not create pencil or dot if button is not 0 or 2', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    service.onPressed(new MouseEvent('mousedown', { button: 3 }));
    service.onMove(new MouseEvent('mousemove'));
    service.onKeyUp(new KeyboardEvent('keyup', {}));
    service.onKeyDown(new KeyboardEvent('keydown', {}));
    service.dropTool();
    const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
    expect(command).toBeUndefined();
  });

  it('should not create pencil or dot if stroke width is not valid', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    (service.parameters.get('maxStrokeWidth') as FormControl).setErrors({ incorrect: true });
    (service.parameters.get('minStrokeWidth') as FormControl).setErrors({ incorrect: true });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    service.onMove(new MouseEvent('mousemove'));
    const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
    expect(command).toBeUndefined();
  });

  it('should create pen', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
    service.onMove(new MouseEvent('mousemove', { button: 0 }));
    const command: PenCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PenCommand;
    expect(command).toBeDefined();
    const pen = command.getPen() as SVGGElement;
    expect(pen).toBeDefined();
    expect(pen.getAttribute('name')).toEqual('pen');
    expect(pen.style.stroke).toEqual('rgb(100, 200, 50)');
    expect(pen.style.opacity).toEqual('0.6');
  });

  it('should create path', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
    service.onPressed(new MouseEvent('mousedown', { button: 0 }));
    service.onMove(new MouseEvent('mousemove', { button: 0 }));
    service.onMove(new MouseEvent('mousemove', { movementX: 2, movementY: 2 }));
    const command: PenCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PenCommand;
    expect(command).toBeDefined();
    const p = command.getPen() as SVGGElement;
    const penPath = p.lastChild as SVGPathElement;
    expect(penPath).toBeDefined();
    expect(penPath.getAttribute('name')).toEqual('pen');
    expect(penPath.getAttribute('d')).toEqual('M 10 12 L 12 14');
    expect(penPath.style.strokeWidth).toEqual('6.61371px');
  });

  it('#onMove should do nothing if called without on press', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
    service.onMove(new MouseEvent('mousemove', { button: 0 }));
    const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
    expect(command).toBeUndefined();
  });

  it('should not create pen', () => {
    const service: PenToolService = TestBed.get(PenToolService);
    const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
    expect(command).toBeUndefined();

  });
});
