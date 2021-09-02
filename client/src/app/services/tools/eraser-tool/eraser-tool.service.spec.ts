import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { EraserToolService } from './eraser-tool.service';

describe('EraserToolService', () => {
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let offsetManagerSpy: jasmine.SpyObj<OffsetManagerService>;
  let service: EraserToolService;
  let drawing: SVGElement;
  let rect1: SVGRectElement;
  let rect2: SVGRectElement;
  let objList: Map<number, SVGElement>;
  let rendererProvider: RendererProviderService;

  beforeEach(() => {
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['getObjectList', 'removeObject', 'addObject']);
    spyDrawingService = {
      ...spyDrawingService,
      drawing: document.createElementNS('svg', 'svg'),
      drawingEmit: new EventEmitter(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DrawingService, useValue: spyDrawingService },
        { provide: OffsetManagerService, useValue: jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']) },
        RendererProviderService,
      ],
    });
    offsetManagerSpy = TestBed.get(OffsetManagerService);
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 15, y: 15 });
    drawingServiceSpy = TestBed.get(DrawingService);
    rendererProvider = TestBed.get(RendererProviderService);
    drawing = rendererProvider.renderer.createElement('svg', 'svg');
    rendererProvider.renderer.setAttribute(drawing, 'width', '200px');
    rendererProvider.renderer.setAttribute(drawing, 'height', '100px');
    rect1 = rendererProvider.renderer.createElement('rect', 'svg');
    rendererProvider.renderer.setAttribute(rect1, 'width', '30px');
    rendererProvider.renderer.setAttribute(rect1, 'height', '30px');
    rendererProvider.renderer.setAttribute(rect1, 'x', '12px');
    rendererProvider.renderer.setAttribute(rect1, 'y', '12px');
    rendererProvider.renderer.setAttribute(rect1, 'name', 'rectangle');
    rendererProvider.renderer.setProperty(rect1, 'id', '2');
    rendererProvider.renderer.appendChild(drawing, rect1);

    const g = rendererProvider.renderer.createElement('g', 'svg');
    rendererProvider.renderer.setProperty(g, 'id', '1');
    rect2 = rendererProvider.renderer.createElement('rect', 'svg');
    rendererProvider.renderer.setAttribute(rect2, 'width', '60px');
    rendererProvider.renderer.setAttribute(rect2, 'height', '60px');
    rendererProvider.renderer.setAttribute(rect2, 'x', '5px');
    rendererProvider.renderer.setAttribute(rect2, 'y', '5px');
    rendererProvider.renderer.setAttribute(rect2, 'name', 'rectangle');
    rendererProvider.renderer.setProperty(rect2, 'id', '1');
    rendererProvider.renderer.appendChild(g, rect2);
    rendererProvider.renderer.appendChild(drawing, g);
    drawingServiceSpy.drawing = drawing;
    objList = new Map<number, SVGElement>();
    objList.set(2, rect1);
    objList.set(1, g);
    drawingServiceSpy.removeObject.and.callFake((id: number) => objList.delete(id));
    drawingServiceSpy.addObject.and.callFake((svgEl: SVGElement) => {
      objList.set(Number(svgEl.id), svgEl);
      return Number(svgEl.id);
    });
    drawingServiceSpy.getObjectList.and.returnValue(objList);
    service = TestBed.get(EraserToolService);
    service.parameters.patchValue({ eraserSize: 20 });
  });

  it('should be created', () => {
    expect(service).toBeDefined();
    expect(service.eraser).toBeDefined();
  });

  it('#onMove should move the eraser and not erase anything', () => {
    service.pickupTool();
    const previousX = service.eraser.getAttribute('x');
    const previousY = service.eraser.getAttribute('y');
    service.onMove(new MouseEvent('mousemouve'));
    expect(service.eraser.getAttribute('x')).not.toEqual(previousX);
    expect(service.eraser.getAttribute('y')).not.toEqual(previousY);
    service.onMove(new MouseEvent('mousemouve'));
    expect(objList.size).toEqual(2);
  });

  it('#onPresse, #onMove, #onRelease should move the eraser and delete the drawings', () => {
    service.pickupTool();
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
    service.onPressed(new MouseEvent('onpress', { button: 0 }));
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 15, y: 15 });
    service.onMove(new MouseEvent('mousemouve'));
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(0);
  });

  it('#onPresse, #onRelease should move the eraser an delete the drawings', () => {
    service.pickupTool();
    service.onPressed(new MouseEvent('onpress', { button: 2 }));
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(0);
  });

  it('#onPresse, #dropTool should not erase anything', () => {
    service.pickupTool();
    service.onPressed(new MouseEvent('onpress', { button: 2 }));
    service.dropTool();
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(2);
  });

  it('#pickupTool should add the eraser', () => {
    service.pickupTool();
    expect(drawing.children.length).toEqual(3);
  });

  it('#onKeyDown, #onKeyUp, #changeTool should do nothing', () => {
    service.onKeyDown(new KeyboardEvent('onkeydown'));
    service.onKeyUp(new KeyboardEvent('onkeyup'));
    service.onRelease(new MouseEvent('onkeyup'));
    expect().nothing();
  });

  it('#onPresse, #onMove, #onRelease should do nothing without pickup', () => {
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
    service.onPressed(new MouseEvent('onpress', { button: 0 }));
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 15, y: 15 });
    service.onMove(new MouseEvent('mousemouve'));
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(2);
  });

  it('#onRelease if not pressed should not erase anything', () => {
    service.pickupTool();
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(2);
  });

  it('#onPresse, #onMove, #onRelease should move the eraser and not do anything on wrong button', () => {
    service.pickupTool();
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
    service.onPressed(new MouseEvent('onpress', { button: 7 }));
    service.onKeyUp(new KeyboardEvent('onkeyup'));
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: 15, y: 15 });
    service.onMove(new MouseEvent('mousemouve'));
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(2);
  });

  it('#onPresse, #onRelease should not contain any element', () => {
    service.pickupTool();
    rendererProvider.renderer.setStyle(rect1, 'strokeWidth', '10px');
    service.parameters.patchValue({ eraserSize: 1 });
    offsetManagerSpy.offsetFromMouseEvent.and.returnValue({ x: -10, y: -10 });
    spyOn(service.eraser, 'getBoundingClientRect')
      .and.returnValue({ left: -100, bottom: -100, top: -200, right: -50, width: 20, height: 20 });
    service.onPressed(new MouseEvent('onpress', { button: 0 }));
    service.onRelease(new MouseEvent('onrelease'));
    expect(objList.size).toEqual(2);
  });

  it('should resize', () => {
    service.pickupTool();
    const previousWidth = service.eraser.getAttribute('width');
    service.parameters.patchValue({ eraserSize: 30 });
    expect(service.eraser.getAttribute('width')).not.toEqual(previousWidth);
  });

  it('should reset its list on command invoke', () => {
    service.pickupTool();
    const commandInvoker = TestBed.get(CommandInvokerService);
    const spy = spyOn(service, 'reset');
    commandInvoker.commandCallEmitter.emit('undo');
    expect(spy).toHaveBeenCalled();
    spy.and.callThrough();
  });
});
