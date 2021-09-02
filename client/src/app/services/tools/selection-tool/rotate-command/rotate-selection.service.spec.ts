import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { RotateFromCenterCommand } from './rotate-from-center-command';
import { RotateOnItselfCommand } from './rotate-on-itself-command';
import { RotateSelectionService } from './rotate-selection.service';

describe('RotateSelectionService', () => {
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let rendererServiceSpy: { renderer: Renderer2 };
  let rotateOnItselfCommandMock: RotateOnItselfCommand;
  let rotateFromCenterCommandMock: RotateFromCenterCommand;

  let svgContour: SVGPolygonElement;

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

    rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [], 0);
    rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, []);
    svgContour = document.createElement('polygon') as Element as SVGPolygonElement;
  });

  it('should be created', () => {
    const service: RotateSelectionService = TestBed.get(RotateSelectionService);
    expect(service).toBeTruthy();
  });

  it('#createRotateCommand should create a rotate command', () => {
    const service: RotateSelectionService = TestBed.get(RotateSelectionService);
    service.createRotateCommand(svgContour, []);
    expect(service.hasCommand()).toBeTruthy();
  });

  it('#endCommand should put the rotate command to null', () => {
    const service: RotateSelectionService = TestBed.get(RotateSelectionService);

    service.createRotateCommand(svgContour, []);
    expect(service.hasCommand()).toBeTruthy();

    service.endCommand();
    expect(service.hasCommand()).toBeFalsy();
  });

  it('#getCommand should get the rotateFromCenter command', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      getCommand: TestBed.get(RotateSelectionService).getCommand,
      rotateFromCenterCommand: rotateFromCenterCommandMock,
      rotateOnItselfCommand: rotateOnItselfCommandMock,
      lastRotation: 'all',
    };
    expect(service.getCommand()).toEqual(rotateFromCenterCommandMock);
    expect(service.getCommand()).not.toEqual(rotateOnItselfCommandMock);
  });

  it('#getCommand should get the rotateOnItself command', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      getCommand: TestBed.get(RotateSelectionService).getCommand,
      rotateFromCenterCommand: rotateFromCenterCommandMock,
      rotateOnItselfCommand: rotateOnItselfCommandMock,
      lastRotation: 'self',
    };
    expect(service.getCommand()).not.toEqual(rotateFromCenterCommandMock);
    expect(service.getCommand()).toEqual(rotateOnItselfCommandMock);
  });

  it('#rotate should call rotate of the rotateFromCenter command with alt to false', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      rotate: TestBed.get(RotateSelectionService).rotate,
      setCtrlPointList: TestBed.get(RotateSelectionService).setCtrlPointList,
      rotateFromCenterCommand: rotateFromCenterCommandMock,
      rotateOnItselfCommand: rotateOnItselfCommandMock,
      isAlt: false,
      isShift: false,
      oldRectBox: svgContour.getBoundingClientRect(),
      xFactor: 0,
    };
    service.setCtrlPointList([document.createElement('rect') as Element as SVGRectElement]);
    const spyCenter = spyOn(rotateFromCenterCommandMock, 'rotate');
    const spySelf = spyOn(rotateOnItselfCommandMock, 'rotate');

    service.rotate(1, svgContour);

    expect(spyCenter).toHaveBeenCalledWith(15, 0, 0);
    expect(spySelf).not.toHaveBeenCalled();
  });

  it('#rotate should call rotate of the rotateOnItself command with alt to true and angle over 360', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      rotate: TestBed.get(RotateSelectionService).rotate,
      setCtrlPointList: TestBed.get(RotateSelectionService).setCtrlPointList,
      rotateFromCenterCommand: rotateFromCenterCommandMock,
      rotateOnItselfCommand: rotateOnItselfCommandMock,
      isAlt: true,
      isShift: true,
      oldRectBox: svgContour.getBoundingClientRect(),
      xFactor: 0,
    };
    service.setCtrlPointList([]);
    const spyCenter = spyOn(rotateFromCenterCommandMock, 'rotate');
    const spySelf = spyOn(rotateOnItselfCommandMock, 'rotate');

    service.rotate(370, svgContour);

    expect(spyCenter).not.toHaveBeenCalled();
    expect(spySelf).toHaveBeenCalledWith(370 - 360);
  });

  it('#rotate should call rotate of the rotateOnItself command with alt to true and angle under 0', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      rotate: TestBed.get(RotateSelectionService).rotate,
      setCtrlPointList: TestBed.get(RotateSelectionService).setCtrlPointList,
      rotateFromCenterCommand: rotateFromCenterCommandMock,
      rotateOnItselfCommand: rotateOnItselfCommandMock,
      isAlt: true,
      isShift: true,
      oldRectBox: svgContour.getBoundingClientRect(),
      xFactor: 0,
    };
    service.setCtrlPointList([]);
    const spyCenter = spyOn(rotateFromCenterCommandMock, 'rotate');
    const spySelf = spyOn(rotateOnItselfCommandMock, 'rotate');

    service.rotate(-50, svgContour);

    expect(spyCenter).not.toHaveBeenCalled();
    expect(spySelf).toHaveBeenCalledWith(-50 + 360);
  });

  it('#rotate should not call rotate of the rotate command', () => {
    let service: RotateSelectionService;
    service = {
      ...TestBed.get(RotateSelectionService),
      rotate: TestBed.get(RotateSelectionService).rotate,
      rotateFromCenterCommand: null,
      rotateOnItselfCommand: null,
    };
    const spyCenter = spyOn(rotateFromCenterCommandMock, 'rotate');
    const spySelf = spyOn(rotateOnItselfCommandMock, 'rotate');

    service.rotate(5, svgContour);

    expect(spyCenter).not.toHaveBeenCalled();
    expect(spySelf).not.toHaveBeenCalledWith();
  });
});
