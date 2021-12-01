import { DeleteSyncCommand } from './sync/delete-sync-command';
import { ResizeSyncCommand } from './sync/resize-sync-command';
import { RotateSyncCommand } from './sync/rotate-sync-command';
import { RectangleSyncCommand } from './sync/rectangle-sync-command';
import { TranslateSyncCommand } from './sync/translate-sync-command';
import { EllipseSyncCommand } from './sync/ellipse-sync-command';
import { SyncDrawingService } from './syncdrawing.service';
import { FreedrawSyncCommand } from './sync/freedraw-sync-command';
import { ICollaborationLoadResponse } from 'src/app/model/ICollaboration.model';
import { TranslateCommand } from './tools/selection-tool/translate-command/translate-command';
import { FilledShape } from './tools/tool-rectangle/filed-shape.model';
import { EllipseCommand } from './tools/tool-ellipse/ellipse-command';
import { toRGBString, hexToRgb, fromAlpha } from './../utils/colors';
import { Pencil } from './tools/pencil-tool/pencil.model';
import { PencilCommand } from './tools/pencil-tool/pencil-command';
import { ActionType, IDeleteAction, ShapeType } from 'src/app/model/IAction.model';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction, IFreedrawUpLoadAction, IShapeAction, ITranslateAction, IFreedrawUpAction, DrawingState, IRotateAction, IResizeAction } from './../model/IAction.model';
import { ToolFactoryService } from './tool-factory.service';
import { Injectable, Renderer2 } from '@angular/core';

class LoadEllipseCommand {
  command: EllipseCommand;

  constructor(
    public payload: IShapeAction,
    private drawingService: DrawingService,
    private renderer: Renderer2,
  ) {
    let shape = {} as FilledShape;
    shape.x = this.payload.x;
    shape.y = this.payload.y;
    shape.width = this.payload.x2 - this.payload.x;
    shape.height = this.payload.y2 - this.payload.y;
    shape.fill = toRGBString([this.payload.rFill, this.payload.gFill, this.payload.bFill]);
    shape.fillOpacity = fromAlpha(this.payload.aFill);
    shape.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
    shape.strokeOpacity = fromAlpha(this.payload.a);
    shape.strokeWidth = this.payload.width;
    this.command = new EllipseCommand(this.renderer, shape, this.drawingService);
    this.command.userId = this.payload.userId;
    this.command.actionId = this.payload.actionId;
    this.command.isSyncAction = true;
  }

  load(): void {
    this.command.execute();
  }
}

class LoadFreedrawCommand {
  command: PencilCommand;

  constructor(public payload: IFreedrawUpLoadAction, private drawingService: DrawingService, private renderer: Renderer2) {
    let pencil: Pencil = {} as Pencil;
    pencil.pointsList = JSON.parse(this.payload.offsets);
    pencil.fill = "none";
    pencil.fillOpacity = "none";
    pencil.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
    pencil.strokeWidth = this.payload.width;
    pencil.strokeOpacity = fromAlpha(this.payload.a);

    this.command = new PencilCommand(this.renderer, pencil, this.drawingService);
  }

  load(): void {
    this.command.execute();
  }
}

class LoadTranslationCommand {
  command: TranslateCommand;
  constructor(public payload: ITranslateAction, private drawingService: DrawingService, private renderer: Renderer2) {

  }

  load(): void {
    return;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DrawingLoadService {
  private callbacks: Record<ActionType, (payload: IAction) => any> = {
    Freedraw: (payload: IFreedrawUpAction & IFreedrawUpLoadAction) => {
      payload.offsets = JSON.parse(payload.offsets);
      const command = new FreedrawSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Shape: (payload: IShapeAction) => {
      if (payload.shapeType === ShapeType.Ellipse) {
        const command = new EllipseSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
        command.isFlatAction = true;
        command.execute();
      } else if (payload.shapeType === ShapeType.Rectangle) {
        const command = new RectangleSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
        command.isFlatAction = true;
        command.execute();
      }
    },
    Select: () => { },
    Translate: (payload: ITranslateAction) => {
      payload.state = DrawingState.move;
      const command = new TranslateSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Rotate: (payload: IRotateAction) => {
      payload.state = DrawingState.move;
      payload.angle = payload.angle * 180 / Math.PI
      const command = new RotateSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Delete: (payload: IDeleteAction) => {
      const command = new DeleteSyncCommand(payload, this.drawingService, null);
      command.execute();
    },
    Resize: (payload: IResizeAction) => {
      payload.state = DrawingState.move;
      const command = new ResizeSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Text: () => { },
    Layer: () => { },
    UndoRedo: () => { },
  }

  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(
    private toolFactoryService: ToolFactoryService,
    private drawingService: DrawingService,
    private syncService: SyncDrawingService
  ) { }

  loadDrawing(): void {
    if (this.activeDrawingData) {
      const convertedHex = hexToRgb(this.activeDrawingData.backgroundColor);
      if (!convertedHex) {
        this.drawingService.newDrawing(1280, 752, {
          rgb: { r: 255, g: 255, b: 255 },
          a: 1,
        });
      } else {
        this.drawingService.newDrawing(1280, 752, {
          rgb: { r: convertedHex.r, g: convertedHex.g, b: convertedHex.b },
          a: 1
        });
      }

      this.isLoading = false;
      this.isLoaded = true;
    }
  }

  loadActions(): void {
    if (this.drawingService.isCreated && this.activeDrawingData) {
      for (let action of this.activeDrawingData.actions) {
        this.callbacks[action.actionType](action);
      }

      for (let action of this.pendingActions) {
        this.toolFactoryService.handleEvent(action);
      }
    }
  }

}
