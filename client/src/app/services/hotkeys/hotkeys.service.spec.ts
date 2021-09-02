import { TestBed } from '@angular/core/testing';

import { EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CommandInvokerService } from '../command-invoker/command-invoker.service';
import { MagnetismService } from '../magnetism/magnetism.service';
import { OpenDrawingDialogService } from '../open-drawing-dialog/open-drawing-dialog.service';
import { SaveDrawingDialogService } from '../save-drawing-dialog/save-drawing-dialog.service';
import { CopyPasteToolService } from '../tools/copy-paste-tool/copy-paste-tool.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { DeletingToolService } from '../tools/selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { ToolsService } from '../tools/tools.service';
import { EmitReturn } from './hotkeys-constants';
import { HotkeysEmitterService } from './hotkeys-emitter/hotkeys-emitter.service';
import { HotkeysService } from './hotkeys.service';

describe('HotkeysService', () => {
  let hotkeyEmitterServiceSpy: jasmine.SpyObj<HotkeysEmitterService>;
  let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;
  let copyPasteServiceSpy: jasmine.SpyObj<CopyPasteToolService>;
  let deletingToolServiceSpy: jasmine.SpyObj<DeletingToolService>;
  let selectionToolServiceSpy: jasmine.SpyObj<SelectionToolService>;

  let toolsServiceSpy: jasmine.SpyObj<ToolsService>;
  let gridServiceSpy: jasmine.SpyObj<GridService>;
  let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;

  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    open: null,
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(() => {
    let hotkeysEmitterServiceSpy = jasmine.createSpyObj('HotkeysEmitterService', ['handleKeyboardEvent']);
    const toolsSpy = jasmine.createSpyObj('ToolsService', ['selectTool']);
    const gridSpy = jasmine.createSpyObj('GridService', ['showGrid', 'hideGrid', 'changeGridSize', 'toggleGrid']);
    const magnetismSpy = jasmine.createSpyObj('MagnetismService', ['toggleMagnetism']);
    const saveSpy = jasmine.createSpyObj('SaveDrawingDialogService', ['openDialog']);
    const copyPasteSpy = jasmine.createSpyObj('CopyPasteToolService', ['copy', 'cut', 'paste', 'duplicate']);
    const selectionSpy = jasmine.createSpyObj('SelectionToolService', ['selectAll']);
    const deletingSpy = jasmine.createSpyObj('DeletingToolService', ['deleteSelection']);
    const openDrawingSpy = jasmine.createSpyObj('OpenDrawingDialogService', ['openDialog']);

    hotkeysEmitterServiceSpy = {
      hotkeyEmitter: new EventEmitter(),
      handleKeyboardEvent: () => { return; },
    };

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: HotkeysEmitterService, useValue: hotkeysEmitterServiceSpy },
        { provide: ToolsService, useValue: toolsSpy },
        { provide: GridService, useValue: gridSpy },
        { provide: MagnetismService, useValue: magnetismSpy },
        { provide: MatDialogRef, useValue: dialogRefSpyObj },
        { provide: SaveDrawingDialogService, useValue: saveSpy },
        { provide: CommandInvokerService, useValue: jasmine.createSpyObj('CommandInvokerSpy', ['undo', 'redo']) },
        { provide: CopyPasteToolService, useValue: copyPasteSpy },
        { provide: SelectionToolService, useValue: selectionSpy },
        { provide: DeletingToolService, useValue: deletingSpy },
        { provide: OpenDrawingDialogService, useValue: openDrawingSpy },
      ],
    });
    hotkeyEmitterServiceSpy = TestBed.get(HotkeysEmitterService);
    toolsServiceSpy = TestBed.get(ToolsService);
    gridServiceSpy = TestBed.get(GridService);
    magnetismServiceSpy = TestBed.get(MagnetismService);
    commandInvokerSpy = TestBed.get(CommandInvokerService);
    copyPasteServiceSpy = TestBed.get(CopyPasteToolService);
    deletingToolServiceSpy = TestBed.get(DeletingToolService);
    selectionToolServiceSpy = TestBed.get(SelectionToolService);

    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
  });

  it('should be created', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    expect(service).toBeTruthy();
  });

  it('should listen to hotkeys', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    spyOn(hotkeyEmitterServiceSpy, 'handleKeyboardEvent');

    service.hotkeysListener();
    window.dispatchEvent(new KeyboardEvent('keydown'));

    expect(hotkeyEmitterServiceSpy.handleKeyboardEvent).toHaveBeenCalled();
  });

  it('should select a tool', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.LINE);

    expect(toolsServiceSpy.selectTool).toHaveBeenCalled();
  });

  it('should not select a tool', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SELECTALL);

    expect(toolsServiceSpy.selectTool).not.toHaveBeenCalled();
  });

  it('should affect grid', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();
    gridServiceSpy.sizeCell = new FormControl();
    gridServiceSpy.sizeCell.setValue(1);

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.CONTROL_GRID);
    expect(gridServiceSpy.toggleGrid).toHaveBeenCalled();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.CONTROL_MAGNETISM);
    expect(magnetismServiceSpy.toggleMagnetism).toHaveBeenCalled();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.ADD5_GRID);
    expect(gridServiceSpy.changeGridSize).toHaveBeenCalled();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SUB5_GRID);
    expect(gridServiceSpy.changeGridSize).toHaveBeenCalled();
  });

  it('should not affect grid', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SELECTALL);
    expect(gridServiceSpy.toggleGrid).not.toHaveBeenCalled();
    expect(gridServiceSpy.changeGridSize).not.toHaveBeenCalled();
  });

  it('should open a dialog', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();
    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.NEW_DRAWING);
    expect(dialogSpy).toHaveBeenCalled();
  });

  it('should open a save drawing dialog', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();
    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SAVE_DRAWING);
    expect(TestBed.get(SaveDrawingDialogService).openDialog).toHaveBeenCalled();
  });

  it('should open a open drawing dialog', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();
    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.OPEN_DRAWING);
    expect(TestBed.get(OpenDrawingDialogService).openDialog).toHaveBeenCalled();
  });

  it('should not open a dialog', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SELECTALL);
    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should undo', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.UNDO);
    expect(commandInvokerSpy.undo).toHaveBeenCalled();
  });

  it('should paste', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.PASTE);
    expect(copyPasteServiceSpy.paste).toHaveBeenCalled();
  });

  it('should cut', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.CUT);
    expect(copyPasteServiceSpy.cut).toHaveBeenCalled();
  });

  it('should copy', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.COPY);
    expect(copyPasteServiceSpy.copy).toHaveBeenCalled();
  });

  it('should duplicate', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.DUPLICATE);
    expect(copyPasteServiceSpy.duplicate).toHaveBeenCalled();
  });

  it('should select all', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.SELECTALL);
    expect(selectionToolServiceSpy.selectAll).toHaveBeenCalled();
  });

  it('should delete', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.DELETE);
    expect(deletingToolServiceSpy.deleteSelection).toHaveBeenCalled();
  });

  it('should redo', () => {
    const service: HotkeysService = TestBed.get(HotkeysService);
    service.hotkeysListener();

    hotkeyEmitterServiceSpy.hotkeyEmitter.emit(EmitReturn.REDO);
    expect(commandInvokerSpy.redo).toHaveBeenCalled();
  });

});
