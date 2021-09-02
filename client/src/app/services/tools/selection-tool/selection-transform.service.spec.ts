import { TestBed } from '@angular/core/testing';

import { SelectionCommandConstants } from './command-type-constant';
import { ResizeSelectionService } from './resize-command/resize-selection.service';
import { RotateSelectionService } from './rotate-command/rotate-selection.service';
import { RotateTranslateCompositeCommand } from './rotate-translate-composite-command/rotate-translate-composite-command';
import { SelectionTransformService } from './selection-transform.service';
import { TranslateCommand } from './translate-command/translate-command';
import { TranslateSelectionService } from './translate-command/translate-selection.service';

describe('SelectionTransformService', () => {
  let resizeSelectionServiceSpy: jasmine.SpyObj<ResizeSelectionService>;
  let rotateSelectionServiceSpy: jasmine.SpyObj<RotateSelectionService>;
  let translateSelectionServiceSpy: jasmine.SpyObj<TranslateSelectionService>;
  beforeEach(() => {
    const spyResize = jasmine.createSpyObj('ResizeSelectionService', [
      'resize', 'resizeWithLastOffset', 'setCtrlPointList', 'createResizeCommand', 'endCommand', 'hasCommand', 'getCommand',
    ]);
    const spyRotate = jasmine.createSpyObj('RotateSelectionService', [
      'rotate', 'setCtrlPointList', 'createRotateCommand', 'endCommand', 'hasCommand', 'getCommand',
    ]);
    const spyTranslate = jasmine.createSpyObj('TranslateSelectionService', [
      'translate', 'createTranslateCommand', 'endCommand', 'hasCommand', 'getCommand',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: ResizeSelectionService, useValue: spyResize },
        { provide: RotateSelectionService, useValue: spyRotate },
        { provide: TranslateSelectionService, useValue: spyTranslate },
      ],
    });

    resizeSelectionServiceSpy = TestBed.get(ResizeSelectionService);
    rotateSelectionServiceSpy = TestBed.get(RotateSelectionService);
    translateSelectionServiceSpy = TestBed.get(TranslateSelectionService);
  });

  it('should be created', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);
    expect(service).toBeTruthy();
  });

  it('#setCtrlPointList should call setCtrlPointList of the RESIZE and ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCtrlPointList([]);

    expect(resizeSelectionServiceSpy.setCtrlPointList).toHaveBeenCalled();
    expect(rotateSelectionServiceSpy.setCtrlPointList).toHaveBeenCalled();
  });

  it('#createCommand should call createCommand of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);
    service.setCommandType(SelectionCommandConstants.NONE);
    const spy = spyOn(service, 'getCommand');
    service.createCommand(SelectionCommandConstants.RESIZE, SVGPolygonElement.prototype, []);

    expect(resizeSelectionServiceSpy.createResizeCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.RESIZE);
    expect(spy).not.toHaveBeenCalled();
  });

  it('#createCommand should call createCommand of the ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);
    service.setCommandType(SelectionCommandConstants.TRANSLATE);
    service.createCommand(SelectionCommandConstants.ROTATE, SVGPolygonElement.prototype, []);

    expect(rotateSelectionServiceSpy.createRotateCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.ROTATE);
  });

  it('#createCommand should call createCommand of the TRANSLATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);
    service.setCommandType(SelectionCommandConstants.ROTATE);
    service.createCommand(SelectionCommandConstants.TRANSLATE, SVGPolygonElement.prototype, []);

    expect(translateSelectionServiceSpy.createTranslateCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.TRANSLATE);
  });

  it('#endCommand should call endCommand of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.RESIZE);
    service.endCommand();

    expect(resizeSelectionServiceSpy.endCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.NONE);
  });

  it('#endCommand should call endCommand of the ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.ROTATE);
    service.endCommand();

    expect(rotateSelectionServiceSpy.endCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.NONE);
  });

  it('#endCommand should call endCommand of the TRANSLATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.TRANSLATE);
    service.endCommand();

    expect(translateSelectionServiceSpy.endCommand).toHaveBeenCalled();
    expect(service.getCommandType()).toEqual(SelectionCommandConstants.NONE);
  });

  it('#setAlt should set isAlt of the RESIZE and ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    expect(resizeSelectionServiceSpy.isAlt).toBeFalsy();
    expect(rotateSelectionServiceSpy.isAlt).toBeFalsy();

    service.setAlt(true);

    expect(resizeSelectionServiceSpy.isAlt).toBeTruthy();
    expect(rotateSelectionServiceSpy.isAlt).toBeTruthy();
  });

  it('#setShift should set isShift of the RESIZE and ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    expect(resizeSelectionServiceSpy.isShift).toBeFalsy();
    expect(rotateSelectionServiceSpy.isShift).toBeFalsy();

    service.setShift(true);

    expect(resizeSelectionServiceSpy.isShift).toBeTruthy();
    expect(rotateSelectionServiceSpy.isShift).toBeTruthy();
  });

  it('#hasCommand should call hasCommand of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.RESIZE);
    service.hasCommand();

    expect(resizeSelectionServiceSpy.hasCommand).toHaveBeenCalled();
  });

  it('#hasCommand should call hasSubCommand of rotateTranslateComposite', () => {
    const compositeMock = new RotateTranslateCompositeCommand();
    compositeMock.addSubCommand(TranslateCommand.prototype);
    const service: SelectionTransformService = {
      ...TestBed.get(SelectionTransformService),
      rotateTranslateComposite: compositeMock,
      hasCommand: TestBed.get(SelectionTransformService).hasCommand,
      setCommandType: TestBed.get(SelectionTransformService).setCommandType,
    };

    service.setCommandType(SelectionCommandConstants.ROTATE);

    expect(service.hasCommand()).toBeTruthy();
  });

  it('#hasCommand should return false due to NONE type', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.NONE);
    service.hasCommand();

    expect(service.hasCommand()).toBeFalsy();
  });

  it('#getCommand should call getCommand of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.setCommandType(SelectionCommandConstants.RESIZE);
    service.getCommand();

    expect(resizeSelectionServiceSpy.getCommand).toHaveBeenCalled();
  });

  it('#getCommand should return rotateTranslateComposite command', () => {
    const compositeMock = new RotateTranslateCompositeCommand();
    const service: SelectionTransformService = {
      ...TestBed.get(SelectionTransformService),
      rotateTranslateComposite: compositeMock,
      getCommand: TestBed.get(SelectionTransformService).getCommand,
      setCommandType: TestBed.get(SelectionTransformService).setCommandType,
    };

    service.setCommandType(SelectionCommandConstants.ROTATE);

    expect(service.getCommand()).toEqual(compositeMock);
  });

  it('#resize should call resize of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.resize(0, 1, { x: 2, y: 3 });

    expect(resizeSelectionServiceSpy.resize).toHaveBeenCalledWith(0, 1, { x: 2, y: 3 });
  });

  it('#resizeWithLastOffset should call resizeWithLastOffset of the RESIZE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.resizeWithLastOffset();

    expect(resizeSelectionServiceSpy.resizeWithLastOffset).toHaveBeenCalled();
  });

  it('#rotate should call getCommand of the ROTATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.rotate(1, SVGPolygonElement.prototype);

    expect(rotateSelectionServiceSpy.rotate).toHaveBeenCalledWith(1, SVGPolygonElement.prototype);
  });

  it('#translate should call getCommand of the TRANSLATE service', () => {
    const service: SelectionTransformService = TestBed.get(SelectionTransformService);

    service.translate(0, 1);

    expect(translateSelectionServiceSpy.translate).toHaveBeenCalledWith(0, 1);
  });
});
