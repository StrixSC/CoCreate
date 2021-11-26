import { ICollaborationLoadResponse } from 'src/app/model/ICollaboration.model';
import { TranslateCommand } from './tools/selection-tool/translate-command/translate-command';
import { FilledShape } from './tools/tool-rectangle/filed-shape.model';
import { EllipseCommand } from './tools/tool-ellipse/ellipse-command';
import { toRGBString, fromAlpha } from './../utils/colors';
import { Pencil } from './tools/pencil-tool/pencil.model';
import { PencilCommand } from './tools/pencil-tool/pencil-command';
import { ActionType, ShapeType } from 'src/app/model/IAction.model';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction, IFreedrawUpLoadAction, IShapeAction, ITranslateAction } from './../model/IAction.model';
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
    Freedraw: (payload: IFreedrawUpLoadAction) => {
      const command = new LoadFreedrawCommand(payload, this.drawingService, this.drawingService.renderer);
      command.load();
    },
    Shape: (payload: IShapeAction) => {
      if (payload.shapeType === ShapeType.Ellipse) {
        const command = new LoadEllipseCommand(payload, this.drawingService, this.drawingService.renderer);
        command.load();
      }
    },
    Select: () => { },
    Translate: (payload: ITranslateAction) => {
      const command = new LoadTranslationCommand(payload, this.drawingService, this.drawingService.renderer);
      command.load();
    },
    Rotate: () => { },
    Delete: () => { },
    Resize: () => { },
    Text: () => { },
    Layer: () => { },
    UndoRedo: () => { },
  }

  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(private toolFactoryService: ToolFactoryService, private drawingService: DrawingService) { }

  loadDrawing(): void {
    if (this.activeDrawingData) {
      this.drawingService.newDrawing(1280, 752, {
        rgb: { r: 255, g: 255, b: 255 },
        a: 1,
      });

      if (this.drawingService.isCreated) {
        for (let action of this.activeDrawingData.actions) {
          // this.callbacks[action.actionType](action);
        }

        for (let action of this.pendingActions) {
          // this.toolFactoryService.handleEvent(action);
        }
      }

      this.isLoading = false;
      this.isLoaded = true;

    }
  }

}
