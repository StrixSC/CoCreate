import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../drawing/drawing.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { CommandInvokerService } from './command-invoker.service';

describe('CommandInvokerService', () => {
  let service: CommandInvokerService;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

  beforeEach(() => {
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject', 'getObject', 'getObjectList']);
    spyDrawingService = {
      ...spyDrawingService,
      drawingEmit: new EventEmitter(),
    };
    const spySelectionService = jasmine.createSpyObj('SelectionToolService', ['removeSelection']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SelectionToolService, useValue: spySelectionService },
        { provide: DrawingService, useValue: spyDrawingService },
      ],
    });
    service = TestBed.get(CommandInvokerService);
    drawingServiceSpy = TestBed.get(DrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to add undo and redo', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command);
    service.undo();
    expect(command.undo).toHaveBeenCalled();
    service.redo();
    expect(command.execute).toHaveBeenCalled();
  });

  it('should be able to execute and add the command', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.executeCommand(command);
    expect(command.execute).toHaveBeenCalled();
    service.undo();
    expect(command.undo).toHaveBeenCalled();
  });

  it('should not call undo on empty list', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.undo();
    expect(command.undo).not.toHaveBeenCalled();
  });

  it('should not call redo on empty list', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo', 'redo']);
    service.redo();
    expect(command.redo).not.toHaveBeenCalled();
  });

  it('should not be able to undo twice with one item', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command);
    service.undo();
    service.undo();
    expect(command.undo).toHaveBeenCalledTimes(1);
  });

  it('should not be able to redo a not undoned command', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo', 'redo']);
    service.addCommand(command);
    service.redo();
    expect(command.redo).not.toHaveBeenCalled();
  });

  it('isUndo should return if you can undo', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command);
    expect(service.canUndo).toBeTruthy();
  });

  it('isUndo should return if you can undo', () => {
    expect(service.canUndo).toBeFalsy();
  });

  it('isUndo should return if you can undo', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command);
    service.undo();
    expect(service.canRedo).toBeTruthy();
  });

  it('isUndo should return if you can undo', () => {
    const command = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command);
    expect(service.canRedo).toBeFalsy();
  });

  it('#clearCommandHistory should clear both command list', () => {
    const command1 = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    const command2 = jasmine.createSpyObj('ICommand', ['execute', 'undo']);
    service.addCommand(command1);
    service.addCommand(command2);
    service.undo();
    drawingServiceSpy.drawingEmit.emit();
    expect(service.canRedo).toBeFalsy();
    expect(service.canUndo).toBeFalsy();
  });
});
