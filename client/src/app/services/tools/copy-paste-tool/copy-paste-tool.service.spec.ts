import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { DeletingToolService } from '../selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from '../selection-tool/selection-tool.service';
import { CopyPasteOffsetService } from './copy-paste-offset.service';
import { CopyPasteToolService } from './copy-paste-tool.service';

describe('CopyPasteToolService', () => {
  let copyPasteOffsetServiceSpy: jasmine.SpyObj<CopyPasteOffsetService>;
  let selectionToolServiceSpy: jasmine.SpyObj<SelectionToolService>;
  let deletingToolServiceSpy: jasmine.SpyObj<DeletingToolService>;
  let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let rendererServiceSpy: { renderer: Renderer2 };

  beforeEach(() => {
    const spyOffset = jasmine.createSpyObj('CopyPasteOffsetService', ['resetPasteOffset', 'resetToConstPasteOffset', 'changePasteOffset']);
    const spySelection = jasmine.createSpyObj('SelectionToolService',
      ['getObjectList', 'getRectSelectionOffset', 'setNewSelection', 'removeSelection']);
    const spyCommandInvoker = jasmine.createSpyObj('CommandInvokerService', ['executeCommand']);
    const spyDelete = jasmine.createSpyObj('DeletingToolService', ['deleteSelection']);

    rendererSpy = jasmine.createSpyObj('Renderer2', ['']);
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject']);
    spyDrawingService = {
      ...spyDrawingService,
      renderer: rendererSpy,
      drawing: document.createElementNS('svg', 'svg') as SVGElement,
    };
    rendererServiceSpy = {
      renderer: rendererSpy,
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CopyPasteOffsetService, useValue: spyOffset },
        { provide: SelectionToolService, useValue: spySelection },
        { provide: CommandInvokerService, useValue: spyCommandInvoker },
        { provide: RendererProviderService, useValue: rendererServiceSpy },
        { provide: DrawingService, useValue: spyDrawingService },
        { provide: DeletingToolService, useValue: spyDelete },
      ],
    });
    TestBed.get(DrawingService).addObject.and.returnValue(1);
    copyPasteOffsetServiceSpy = TestBed.get(CopyPasteOffsetService);
    selectionToolServiceSpy = TestBed.get(SelectionToolService);
    commandInvokerSpy = TestBed.get(CommandInvokerService);
    deletingToolServiceSpy = TestBed.get(DeletingToolService);
  });

  it('should be created', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    expect(service).toBeTruthy();
  });

  it('#copy should reset the paste offset and not delete selection', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    selectionToolServiceSpy.getObjectList.and.returnValue([]);

    service.copy();

    expect(copyPasteOffsetServiceSpy.resetToConstPasteOffset).toHaveBeenCalled();
    expect(deletingToolServiceSpy.deleteSelection).not.toHaveBeenCalled();
  });

  it('#cut should call changePasteOffset and delete selection', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    selectionToolServiceSpy.getObjectList.and.returnValue([]);

    copyPasteOffsetServiceSpy.pasteOffset = { x: 5, y: 5 };
    expect(copyPasteOffsetServiceSpy.pasteOffset).toEqual({ x: 5, y: 5 });

    service.cut();

    expect(copyPasteOffsetServiceSpy.resetPasteOffset).toHaveBeenCalled();
    expect(deletingToolServiceSpy.deleteSelection).toHaveBeenCalled();
  });

  it('#paste should do nothing', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);

    service.paste();

    expect(copyPasteOffsetServiceSpy.changePasteOffset).not.toHaveBeenCalled();
    expect(commandInvokerSpy.executeCommand).not.toHaveBeenCalled();
  });

  it('#paste should clone the object of the pasted list', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    const svgEl = document.createElement('rect') as Element as SVGElement;
    const spy = spyOn(svgEl, 'cloneNode').and.returnValue(svgEl);
    selectionToolServiceSpy.getObjectList.and.returnValue([svgEl]);

    service.copy();
    service.paste();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(copyPasteOffsetServiceSpy.changePasteOffset).toHaveBeenCalled();
    expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
  });

  it('#duplicate should add a command to the command invoker and get the object from selection service', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    selectionToolServiceSpy.getObjectList.and.returnValue([]);

    service.duplicate();

    expect(selectionToolServiceSpy.getObjectList).toHaveBeenCalled();
    expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
  });

  it('#duplicate should clone the object of the pasted list', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    const svgEl = document.createElement('rect') as Element as SVGElement;
    const spy = spyOn(svgEl, 'cloneNode').and.returnValue(svgEl);
    selectionToolServiceSpy.getObjectList.and.returnValue([svgEl]);

    service.duplicate();
    service.duplicate();

    expect(spy).toHaveBeenCalledTimes(2);
    expect(selectionToolServiceSpy.getObjectList).toHaveBeenCalled();
    expect(commandInvokerSpy.executeCommand).toHaveBeenCalled();
  });

  it('#hasClipboardObject should return true if clipboard as some object', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    selectionToolServiceSpy.getObjectList.and.returnValue([document.createElement('rect') as Element as SVGElement]);
    let isTrue = false;
    service.copy();
    isTrue = service.hasClipboardObject();

    expect(isTrue).toBeTruthy();
  });

  it('#hasClipboardObject should return false if clipboard as no object', () => {
    const service: CopyPasteToolService = TestBed.get(CopyPasteToolService);
    selectionToolServiceSpy.getObjectList.and.returnValue([]);
    let isTrue = true;
    service.copy();
    isTrue = service.hasClipboardObject();

    expect(isTrue).toBeFalsy();
  });
});
