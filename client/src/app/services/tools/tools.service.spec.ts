import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { CommandInvokerService } from '../command-invoker/command-invoker.service';
import { DrawingService } from '../drawing/drawing.service';
import { BrushToolService } from './brush-tool/brush-tool.service';
import { BucketFillToolService } from './bucket-fill-tool/bucket-fill-tool.service';
import { EraserToolService } from './eraser-tool/eraser-tool.service';
import { GridService } from './grid-tool/grid.service';
import { Tools } from '../../interfaces/tools.interface';
import { LineToolService } from './line-tool/line-tool.service';
import { PencilToolService } from './pencil-tool/pencil-tool.service';
import { PipetteToolService } from './pipette-tool/pipette-tool.service';
import { PolygonToolService } from './polygon-tool/polygon-tool.service';
import { SelectionToolService } from './selection-tool/selection-tool.service';
import { StampToolService } from './stamp-tool/stamp-tool.service';
import { TextToolService } from './text-tool/text-tool.service';
import { ToolEllipseService } from './tool-ellipse/tool-ellipse.service';
import { ToolIdConstants } from './tool-id-constants';
import { ToolRectangleService } from './tool-rectangle/tool-rectangle.service';
import { ToolsApplierColorsService } from './tools-applier-colors/tools-applier-colors.service';
import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  let pencilToolServiceSpy: jasmine.SpyObj<PencilToolService>;
  let commandInvokerSpy: jasmine.SpyObj<CommandInvokerService>;
  let selectToolServiceSpy: jasmine.SpyObj<SelectionToolService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let tool: Tools;

  beforeEach(() => {
    tool = {
      id: 0, faIcon: faSquare, toolName: 'tool', parameters: FormGroup.prototype,
      onPressed() { return; }, onRelease() { return; }, onMove() { return; },
      onKeyDown() { return; }, onKeyUp() { return; }, pickupTool() { return; }, dropTool() { return; },
    };
    const spyPencil = jasmine.createSpyObj('PencilToolService', ['onKeyDown', 'onKeyUp', 'onPressed', 'dropTool', 'pickupTool']);
    const spyBrush = jasmine.createSpyObj('BrushToolService', ['']);
    const spyApplier = jasmine.createSpyObj('ToolsApplierColorsService', ['']);
    const spyRect = jasmine.createSpyObj('ToolRectangleService', ['']);
    const spyEllipse = jasmine.createSpyObj('ToolEllipseService', ['']);
    const spyPipette = jasmine.createSpyObj('PipetteToolService', ['']);
    const spyEtampe = jasmine.createSpyObj('EtampeToolService', ['']);
    const spyGrid = jasmine.createSpyObj('GridService', ['']);
    const spyText = jasmine.createSpyObj('TextToolService', ['dropTool', 'pickupTool']);
    const spyPoly = jasmine.createSpyObj('PolygonToolService', ['']);
    const spyLine = jasmine.createSpyObj('LineToolService', ['dropTool', 'pickupTool']);
    const spySelection = jasmine.createSpyObj('SelectionToolService', ['removeSelection', 'dropTool', 'pickupTool']);
    const invokerSpy = jasmine.createSpyObj('CommandInvokerService', ['addCommand', 'undo', 'redo', 'commandCallEmitter']);
    const drawingSpy = jasmine.createSpyObj('DrawingService', ['']);
    const spyBucketFill = jasmine.createSpyObj('BucketFillToolService', ['']);
    const spyEraser = jasmine.createSpyObj('EraserToolService', ['']);

    TestBed.configureTestingModule({
      providers: [
        { provide: CommandInvokerService, useValue: invokerSpy },
        { provide: PencilToolService, useValue: spyPencil },
        { provide: BrushToolService, useValue: spyBrush },
        { provide: ToolsApplierColorsService, useValue: spyApplier },
        { provide: ToolRectangleService, useValue: spyRect },
        { provide: ToolEllipseService, useValue: spyEllipse },
        { provide: PipetteToolService, useValue: spyPipette },
        { provide: StampToolService, useValue: spyEtampe },
        { provide: GridService, useValue: spyGrid },
        { provide: PolygonToolService, useValue: spyPoly },
        { provide: LineToolService, useValue: spyLine },
        { provide: TextToolService, useValue: spyText },
        { provide: SelectionToolService, useValue: spySelection },
        { provide: DrawingService, useValue: drawingSpy },
        { provide: BucketFillToolService, useValue: spyBucketFill },
        {provide: EraserToolService, useValue: spyEraser},
      ],
    });
    pencilToolServiceSpy = TestBed.get(PencilToolService);
    selectToolServiceSpy = TestBed.get(SelectionToolService);
    commandInvokerSpy = TestBed.get(CommandInvokerService);
    drawingServiceSpy = TestBed.get(DrawingService);

    drawingServiceSpy.isCreated = true;
  });

  it('should be created', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    expect(service).toBeTruthy();
  });

  it('tools should not be empty', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    expect(service.tools.size).toBeGreaterThan(0);
  });

  it('call on selectedTool', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    expect(service.selectedToolId).toEqual(0);
    service.selectTool(2);
    expect(service.selectedToolId).toEqual(2);
  });

  it('#onPressed calls onPressed of the current tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onPressed').and.returnValue();

    service.selectTool(0);
    service.onPressed(mouseEvent);

    expect(tool.onPressed).toHaveBeenCalled();
  });

  it('#onPressed does not call onPressed of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onPressed').and.returnValue();

    service.selectTool(1);
    service.onPressed(mouseEvent);

    expect(tool.onPressed).not.toHaveBeenCalled();
  });

  it('#onPressed does not call onPressed of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    tool = {
      id: ToolIdConstants.SELECTION_ID, faIcon: faSquare, toolName: 'tool', parameters: FormGroup.prototype,
      onPressed() { return; }, onRelease() { return; }, onMove() { return; }, pickupTool() { return; }, dropTool() { return; },
      onKeyDown() { return; }, onKeyUp() { return; },
    };
    service.tools.set(ToolIdConstants.SELECTION_ID, tool);
    service.selectTool(ToolIdConstants.SELECTION_ID);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onPressed').and.returnValue();

    service.onPressed(mouseEvent);

    expect(selectToolServiceSpy.removeSelection).not.toHaveBeenCalled();
  });

  it('#onRelease calls onRelease of the current tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onRelease').and.returnValue();

    service.selectTool(0);
    service.onPressed(mouseEvent);
    service.onRelease(mouseEvent);

    expect(tool.onRelease).toHaveBeenCalled();
  });

  it('#onRelease calls onRelease of the current tool and return a command', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onRelease').and.returnValue({} as ICommand);

    service.selectTool(0);
    service.onPressed(mouseEvent);
    service.onRelease(mouseEvent);

    expect(tool.onRelease).toHaveBeenCalled();
    expect(commandInvokerSpy.addCommand).toHaveBeenCalled();
  });

  it('#onRelease does not calls onRelease of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onRelease').and.returnValue();

    service.selectTool(1);
    service.onPressed(mouseEvent);
    service.onRelease(mouseEvent);

    expect(tool.onRelease).not.toHaveBeenCalled();
  });

  it('#onRelease does not calls onRelease of the current tool because there was no click', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onRelease').and.returnValue();

    service.selectTool(0);
    service.onRelease(mouseEvent);

    expect(tool.onRelease).not.toHaveBeenCalled();
  });

  it('#onMove calls onMove of the current tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onMove');

    service.selectTool(0);
    service.onPressed(mouseEvent);
    service.onMove(mouseEvent);

    expect(tool.onMove).toHaveBeenCalled();
  });

  it('#onMove does not calls onMove of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onMove').and.returnValue();

    service.selectTool(1);
    service.onPressed(mouseEvent);
    service.onMove(mouseEvent);

    expect(tool.onMove).not.toHaveBeenCalled();
  });

  it('#onMove does not calls onMove of the current tool because there was no click', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    spyOn(tool, 'onMove').and.returnValue();

    service.selectTool(0);
    service.onMove(mouseEvent);

    expect(tool.onMove).not.toHaveBeenCalled();
  });

  it('#onKeyTriggered calls onKeyDown of the current tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const keyEvent = new KeyboardEvent('keydown');
    const mouseEvent = new MouseEvent('mousedown');

    spyOn(tool, 'onKeyDown').and.returnValue();

    service.selectTool(0);
    service.onPressed(mouseEvent);

    window.dispatchEvent(keyEvent);

    expect(tool.onKeyDown).toHaveBeenCalled();
  });

  it('#onKeyTriggered does not calls onKeyDown of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, pencilToolServiceSpy);

    const mouseEvent = new MouseEvent('mousedown');

    service.onPressed(mouseEvent);
    service.selectTool(1);
    service.onPressed(mouseEvent);

    //     window.dispatchEvent(keyEvent);

    expect(pencilToolServiceSpy.onKeyDown).not.toHaveBeenCalled();
  });

  it('#onKeyTriggered does not calls onKeyDown of the current tool because there was no click', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, pencilToolServiceSpy);

    const keyEvent = new KeyboardEvent('keydown');

    service.selectTool(0);

    window.dispatchEvent(keyEvent);

    expect(pencilToolServiceSpy.onKeyDown).not.toHaveBeenCalled();
  });

  it('#onKeyTriggered calls onKeyUp of the current tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, tool);

    const keyEvent = new KeyboardEvent('keyup');
    const mouseEvent = new MouseEvent('mousedown');

    spyOn(tool, 'onKeyUp').and.returnValue();

    service.selectTool(0);
    service.onPressed(mouseEvent);

    window.dispatchEvent(keyEvent);

    expect(tool.onKeyUp).toHaveBeenCalled();
  });

  it('#onKeyTriggered does not calls onKeyUp of the current tool because there is no tool', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, pencilToolServiceSpy);

    const keyEvent = new KeyboardEvent('keyup');
    const mouseEvent = new MouseEvent('mousedown');

    service.selectTool(1);
    service.onPressed(mouseEvent);

    window.dispatchEvent(keyEvent);

    expect(pencilToolServiceSpy.onKeyUp).not.toHaveBeenCalled();
  });

  it('#onKeyTriggered does not calls onKeyUp of the current tool because there was no click', () => {
    const service: ToolsService = TestBed.get(ToolsService);

    service.tools.clear();
    service.tools.set(0, pencilToolServiceSpy);

    const keyEvent = new KeyboardEvent('keyup');

    service.selectTool(0);

    window.dispatchEvent(keyEvent);

    expect(pencilToolServiceSpy.onKeyUp).not.toHaveBeenCalled();
  });

  it('#onPressed does nothing if isCreated of drawing service is false', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    drawingServiceSpy.isCreated = false;
    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');
    service.selectTool(0);

    service.onPressed(mouseEvent);
    expect().nothing();
    service.onMove(mouseEvent);
    expect().nothing();
    service.onRelease(mouseEvent);
    expect().nothing();
  });

  it('#onKeyTriggered does nothing if isCreated of drawing service is false', () => {
    const service: ToolsService = TestBed.get(ToolsService);
    drawingServiceSpy.isCreated = false;
    service.tools.clear();
    service.tools.set(0, tool);

    const mouseEvent = new MouseEvent('mousedown');

    service.selectTool(0);
    service.onPressed(mouseEvent);

    window.dispatchEvent(new KeyboardEvent('keydown'));
    window.dispatchEvent(new KeyboardEvent('keyup'));

    expect().nothing();
  });

});
