import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { ResizeCommand } from './resize-command';
import { ResizeSelectionService } from './resize-selection.service';

describe('ResizeSelectionService', () => {
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let rendererServiceSpy: { renderer: Renderer2 };
  let resizeCommandMock: ResizeCommand;

  let svgContour: SVGPolygonElement;
  const svgCtrlPoint = document.createElement('rect') as Element as SVGRectElement;
  const svgCtrlPointListMock: SVGRectElement[] = [
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
    svgCtrlPoint.cloneNode() as SVGRectElement,
  ];

  beforeEach(() => {
    let spyDrawing = jasmine.createSpyObj('DrawingService', ['']);
    spyDrawing = {
      ...spyDrawing,
      drawing: document.createElement('svg') as Element as SVGElement,
    };
    rendererSpy = jasmine.createSpyObj('Renderer2', ['setAttribute']);
    rendererServiceSpy = {
      renderer: rendererSpy,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DrawingService, useValue: spyDrawing },
        { provide: RendererProviderService, useValue: rendererServiceSpy },
      ],
    });

    resizeCommandMock = new ResizeCommand(rendererSpy, []);
    svgContour = document.createElement('polygon') as Element as SVGPolygonElement;
  });

  it('should be created', () => {
    const service: ResizeSelectionService = TestBed.get(ResizeSelectionService);
    expect(service).toBeTruthy();
  });

  it('#createResizeCommand should create a resize command', () => {
    const service: ResizeSelectionService = TestBed.get(ResizeSelectionService);
    service.createResizeCommand(svgContour, [], { x: 0, y: 0 }, null);
    expect(service.hasCommand()).toBeTruthy();
  });

  it('#endCommand should put the resize command to null', () => {
    const service: ResizeSelectionService = TestBed.get(ResizeSelectionService);

    service.createResizeCommand(svgContour, [], { x: 0, y: 0 }, null);
    expect(service.hasCommand()).toBeTruthy();

    service.endCommand();
    expect(service.hasCommand()).toBeFalsy();
  });

  it('#getCommand should get the resizeFromCenter command', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      getCommand: TestBed.get(ResizeSelectionService).getCommand,
      resizeCommand: resizeCommandMock,
    };
    expect(service.getCommand()).toEqual(resizeCommandMock);
  });

  it('#resizeWithLastOffset should call resize and put the last offset', () => {
    const lastOffsetMock = { x: 9, y: 22 };
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      resizeWithLastOffset: TestBed.get(ResizeSelectionService).resizeWithLastOffset,
      resizeCommand: resizeCommandMock,
      lastOffset: lastOffsetMock,
    };

    const spy = spyOn(service, 'resize');

    service.resizeWithLastOffset();

    expect(spy).toHaveBeenCalledWith(0, 0, lastOffsetMock);
  });

  it('#resize should call resize with good value from top left and isShift to false', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topLeftResize: TestBed.get(ResizeSelectionService).topLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[0],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(5, 4, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(35 / 40, 46 / 50, 40, 50);
  });

  it('#resize should call resize with good value from top left and isShift to true', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topLeftResize: TestBed.get(ResizeSelectionService).topLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[0],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(5, 4, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(35 / 40, 35 / 40, 40, 50);
  });

  it('#resize should call resize with good value from top left and isShift to true and offset outside the box', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topLeftResize: TestBed.get(ResizeSelectionService).topLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[0],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(-4, 5, { x: 42, y: 52 });

    expect(spy).toHaveBeenCalledWith(45 / 50, 45 / 50, 40, 50);
  });

  it('#resize should call resize with good value from top middle', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topMiddleResize: TestBed.get(ResizeSelectionService).topMiddleResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[1],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(4, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(1, 45 / 50, 0, 50);
  });

  it('#resize should call resize with good value from top right with isShift at false', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topRightResize: TestBed.get(ResizeSelectionService).topRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[2],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(46 / 40, 45 / 50, 0, 50);
  });

  it('#resize should call resize with good value from top right with isShift at true', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topRightResize: TestBed.get(ResizeSelectionService).topRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[2],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(45 / 50, 45 / 50, 0, 50);
  });

  it('#resize should call resize with good value from top right with isShift at true and offset outside the box', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      topRightResize: TestBed.get(ResizeSelectionService).topRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[2],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(-6, 5, { x: -2, y: 52 });

    expect(spy).toHaveBeenCalledWith(34 / 40, 34 / 40, 0, 50);
  });

  it('#resize should call resize with good value from middle right', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      middleRightResize: TestBed.get(ResizeSelectionService).middleRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[3],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(4, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(55 / 50, 1, 0, 0);
  });

  it('#resize should call resize with good value from bottom right with isShift at false', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomRightResize: TestBed.get(ResizeSelectionService).bottomRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[4],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(46 / 40, 55 / 50, 0, 0);
  });

  it('#resize should call resize with good value from bottom right with isShift at true', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomRightResize: TestBed.get(ResizeSelectionService).bottomRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[4],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(55 / 50, 55 / 50, 0, 0);
  });

  it('#resize should call resize with good value from bottom right with isShift at true and offset outside the box', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomRightResize: TestBed.get(ResizeSelectionService).bottomRightResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[4],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(-6, 5, { x: -2, y: -2 });

    expect(spy).toHaveBeenCalledWith(34 / 40, 34 / 40, 0, 0);
  });

  it('#resize should call resize with good value from bottom middle', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomMiddleResize: TestBed.get(ResizeSelectionService).bottomMiddleResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[5],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(4, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(1, 55 / 50, 0, 0);
  });

  it('#resize should call resize with good value from bottom left with isShift at false', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomLeftResize: TestBed.get(ResizeSelectionService).bottomLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[6],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(34 / 40, 55 / 50, 40, 0);
  });

  it('#resize should call resize with good value from bottom left with isShift at true', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomLeftResize: TestBed.get(ResizeSelectionService).bottomLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[6],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(34 / 40, 34 / 40, 40, 0);
  });

  it('#resize should call resize with good value from bottom left with isShift at true and offset outside the box', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomLeftResize: TestBed.get(ResizeSelectionService).bottomLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[6],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: true,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(-6, 5, { x: 43, y: -2 });

    expect(spy).toHaveBeenCalledWith(55 / 50, 55 / 50, 40, 0);
  });

  it('#resize should call resize with good value from middle left', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      middleLeftResize: TestBed.get(ResizeSelectionService).middleLeftResize,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[7],
      ctrlPointList: svgCtrlPointListMock,
      isAlt: false,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 40, 50),
      xFactor: 0,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(4, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(36 / 40, 1, 40, 0);
  });

  it('#resize should call resize with good value from bottom right and isAlt to true', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      bottomRightResize: TestBed.get(ResizeSelectionService).bottomRightResize,
      setCtrlPointList: TestBed.get(ResizeSelectionService).setCtrlPointList,
      resizeCommand: resizeCommandMock,
      ctrlPoint: svgCtrlPointListMock[4],
      isAlt: true,
      isShift: false,
      oldRectBox: new DOMRect(0, 0, 10, 20),
      xFactor: 0,
    };

    service.setCtrlPointList(svgCtrlPointListMock);

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).toHaveBeenCalledWith(11 / 5, 15 / 10, 5, 10);
  });

  it('#resize should do nothing because theres no command', () => {
    let service: ResizeSelectionService;
    service = {
      ...TestBed.get(ResizeSelectionService),
      resize: TestBed.get(ResizeSelectionService).resize,
      resizeCommand: null,
    };

    const spy = spyOn(resizeCommandMock, 'resize');

    service.resize(6, 5, { x: 3, y: 2 });

    expect(spy).not.toHaveBeenCalled();
  });
});
