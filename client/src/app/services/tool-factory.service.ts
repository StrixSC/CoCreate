import { SyncDrawingService } from './syncdrawing.service';
import { ISelectionAction } from './../model/IAction.model';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { EllipseCommand } from './tools/tool-ellipse/ellipse-command';
import { setStyle } from "src/app/utils/colors";
import { ToolRectangleService } from "src/app/services/tools/tool-rectangle/tool-rectangle.service";
import { RectangleCommand } from "./tools/tool-rectangle/rectangle-command";
import { FilledShape } from "./tools/tool-rectangle/filed-shape.model";
import { CollaborationService } from "./collaboration.service";
import { toRGBString, fromAlpha } from "./../utils/colors";
import { ICommand } from "src/app/interfaces/command.interface";
import { DrawingService } from "src/app/services/drawing/drawing.service";
import {
  IDefaultActionPayload,
  IShapeAction,
  ActionType,
  IAction,
  IFreedrawAction,
  IFreedrawUpAction,
  DrawingState,
  IUndoRedoAction,
  ShapeType,
} from "../model/IAction.model";
import { Injectable } from "@angular/core";
import { Pencil } from "./tools/pencil-tool/pencil.model";
import { PencilCommand } from "./tools/pencil-tool/pencil-command";
import { RendererProviderService } from "./renderer-provider/renderer-provider.service";

@Injectable({
  providedIn: "root",
})
export class ToolFactoryService {
  private currentCommand: ICommand;

  tools: Record<ActionType | string, (payload: IAction) => any> = {
    Freedraw: (
      payload: IDefaultActionPayload & IFreedrawAction & IFreedrawUpAction
    ) => {
      if (payload.state === DrawingState.down) {
        let pencil: Pencil = {} as Pencil;
        pencil.pointsList = [{ x: payload.x, y: payload.y }];
        pencil.fill = "none";
        pencil.fillOpacity = "none";
        pencil.stroke = toRGBString([payload.r, payload.g, payload.b]);
        pencil.strokeWidth = payload.width;
        pencil.strokeOpacity = fromAlpha(payload.a);

        this.currentCommand = new PencilCommand(
          this.rendererService.renderer,
          pencil,
          this.drawingService
        );
        this.currentCommand.actionId = payload.actionId;
        (this.currentCommand as PencilCommand).userId = payload.userId;
        this.currentCommand.execute();
      } else if (payload.state === DrawingState.move) {
        (this.currentCommand as PencilCommand).addPoint({
          x: payload.x,
          y: payload.y,
        });
      } else if (payload.state === DrawingState.up) {
        this.addOrUpdateCollaboration(payload.userId, { data: payload, command: this.currentCommand, isUndone: false });
      }
    },
    Select: (payload: ISelectionAction) => {
      // this.collaborationService.selectAction(payload.userId, payload.actionId);
      console.log(payload);
      this.selectionService.selectByActionId(payload.actionId, payload.userId);

    },
    Shape: (payload: IShapeAction) => {

      if (payload.state === DrawingState.down) {
        let shape = {} as FilledShape;
        (shape.x = payload.x1),
          (shape.y = payload.y1),
          (shape.width = payload.x2 - payload.x1);
        shape.height = payload.y2 - payload.x2;
        shape.fill = toRGBString([payload.rFill, payload.gFill, payload.bFill]);
        shape.fillOpacity = fromAlpha(payload.aFill);
        shape.stroke = toRGBString([payload.r, payload.g, payload.b]);
        shape.strokeOpacity = fromAlpha(payload.a);
        shape.strokeWidth = payload.width;

        if (payload.shapeType === ShapeType.Ellipse) {
          this.currentCommand = new EllipseCommand(
            this.rendererService.renderer,
            shape,
            this.drawingService
          )
          this.currentCommand.isSyncAction = true;
        } else {
          this.currentCommand = new RectangleCommand(
            this.rendererService.renderer,
            shape,
            this.drawingService
          );
        }

        setStyle(
          shape,
          shape.fill,
          shape.fillOpacity,
          shape.stroke,
          shape.strokeOpacity,
          payload.shapeStyle
        );

        this.currentCommand.execute();
      } else if (payload.state === DrawingState.move) {
        if (payload.shapeType === ShapeType.Rectangle) {
          (this.currentCommand as RectangleCommand).setX(payload.x1);
          (this.currentCommand as RectangleCommand).setY(payload.y1);
          (this.currentCommand as RectangleCommand).setWidth(
            payload.x2 - payload.x1
          );
          (this.currentCommand as RectangleCommand).setHeight(
            payload.y2 - payload.y1
          );
        } else {
          (this.currentCommand as EllipseCommand).setCX(payload.x1);
          (this.currentCommand as EllipseCommand).setCY(payload.y1);
          (this.currentCommand as EllipseCommand).setWidth(
            payload.x2 - payload.x1
          );
          (this.currentCommand as EllipseCommand).setHeight(
            payload.y2 - payload.y1
          );
        }
      } else if (payload.state === DrawingState.up) {
        this.addOrUpdateCollaboration(payload.userId, { data: payload, command: this.currentCommand, isUndone: false });
      }

    },
    Delete: () => {
      return;
    },
    Translate: () => {
      return;
    },
    Rotate: () => {
      return;
    },
    Resize: () => {
      return;
    },
    UndoRedo: (payload: IDefaultActionPayload & IUndoRedoAction) => {
      if (payload.isUndo) {
        this.collaborationService.undoUserAction(
          payload.userId,
          payload.actionId
        );
      } else {
        this.collaborationService.redoUserAction(
          payload.userId,
          payload.actionId
        );
      }
    },
    Layer: () => {
      return;
    },
    Text: () => { },
    'Save': (payload: { collaborationId: string, actionId: string, userId: string, actionType: string }) => {
      const { actionId, userId } = payload;
      if (userId !== this.syncService.defaultPayload!.userId) {
        return;
      }
      this.selectionService.selectByActionId(actionId, userId);
    },
  };

  constructor(
    private rendererService: RendererProviderService,
    private drawingService: DrawingService,
    private selectionService: SelectionToolService,
    private collaborationService: CollaborationService,
    private syncService: SyncDrawingService
  ) { }

  create(payload: IAction): ICommand | null {
    const callback = this.tools[payload.actionType];
    if (callback) {
      return callback(payload);
    } else return null;
  }

  handleEvent(payload: IAction): ICommand | null {
    return this.create(payload);
  }

  addOrUpdateCollaboration(userId: string, payload: { data: IAction, command: ICommand, isUndone: boolean }) {
    this.collaborationService.addUser(userId);
    this.collaborationService.addActionToUser(userId, payload);
    console.log(this.collaborationService.getUserActions);
  }
}
