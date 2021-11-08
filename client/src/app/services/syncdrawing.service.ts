import { FilledShape } from "./tools/tool-rectangle/filed-shape.model";
import {
  IUndoRedoAction,
  IShapeAction,
  ShapeType,
  ShapeStyle,
} from "./../model/IAction.model";
import { fromRGB, fromOpacity } from "../utils/colors";
import { Pencil } from "./tools/pencil-tool/pencil.model";
import { ICommand } from "src/app/interfaces/command.interface";
import { Observable } from "rxjs";
import { ToolFactoryService } from "./tool-factory.service";
import {
  DrawingState,
  IAction,
  IFreedrawUpAction,
  IDefaultActionPayload,
  ActionType,
} from "../model/IAction.model";
import { Injectable } from "@angular/core";
import { SocketService } from "./chat/socket.service";
import { v4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class SyncDrawingService {
  defaultPayload: IDefaultActionPayload | null;

  private readonly R = 0;
  private readonly G = 1;
  private readonly B = 2;
  public activeActionId: string = "";

  constructor(
    private socketService: SocketService,
    private toolFactory: ToolFactoryService
  ) {
    this.defaultPayload = null;
  }

  onFreedraw(): Observable<void> {
    return this.socketService.on("freedraw:received");
  }

  sendFreedraw(state: DrawingState, pencil: Pencil) {
    if (!this.defaultPayload || !pencil) {
      return;
    }

    let rgb = [0, 0, 0];
    let alpha = 255;

    if (state === DrawingState.down) {
      this.activeActionId = v4();
    }

    if (pencil.stroke !== "none") {
      rgb = fromRGB(pencil.stroke);
    }

    if (pencil.strokeOpacity !== "none") {
      alpha = fromOpacity(pencil.strokeOpacity);
    }

    let payload = {
      ...this.defaultPayload,
      actionId: this.activeActionId,
      r: rgb[this.R],
      g: rgb[this.G],
      b: rgb[this.B],
      a: alpha,
      state: state,
      width: pencil.strokeWidth || 1,
      isSelected: true,
      actionType: ActionType.Freedraw,
    } as IDefaultActionPayload & IFreedrawUpAction;

    if (state === DrawingState.up) {
      payload.isSelected = "false" as unknown as boolean;
    }

    const lastPoint = pencil.pointsList[pencil.pointsList.length - 1];

    if (state === DrawingState.down || DrawingState.move) {
      payload.x = lastPoint.x;
      payload.y = lastPoint.y;
    }

    if (state === DrawingState.up) {
      payload.offsets = pencil.pointsList;
    }

    this.socketService.emit("freedraw:emit", payload);
  }

  sendShape(
    state: DrawingState,
    shapeStyle: ShapeStyle,
    shapeType: ShapeType,
    shape: FilledShape
  ) {
    if (!this.defaultPayload || !shapeType || !shape) {
      return;
    }

    let rgb = [0, 0, 0];
    let fillRgb = [0, 0, 0];

    let alpha = 255;
    let fillAlpha = 255;

    if (shape.stroke !== "none") {
      rgb = fromRGB(shape.stroke);
    }

    if (shape.strokeOpacity !== "none") {
      alpha = fromOpacity(shape.strokeOpacity);
    }

    if (shape.fill !== "none") {
      fillRgb = fromRGB(shape.fill);
    }

    if (shape.fillOpacity !== "none") {
      fillAlpha = fromOpacity(shape.fillOpacity);
    }

    let payload: IShapeAction = {
      ...this.defaultPayload,
      actionId: this.activeActionId,
      x1: shape.x,
      y1: shape.y,
      x2: shape.x + shape.width,
      y2: shape.y + shape.height,
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
      a: alpha,
      rFill: fillRgb[0],
      gFill: fillRgb[1],
      bFill: fillRgb[2],
      aFill: fillAlpha,
      state: state,
      shapeType: shapeType,
      width: shape.strokeWidth,
      isSelected: true,
      shapeStyle: shapeStyle,
      actionType: ActionType.Shape,
    };

    if (state === DrawingState.up) {
      payload.isSelected = "false" as unknown as boolean;
    }

    this.socketService.emit("shape:emit", payload);
  }

  sendUndo(command: ICommand): void {
    this.socketService.emit("undoredo:emit", {
      ...this.defaultPayload,
      actionType: ActionType.UndoRedo,
      actionId: command.actionId,
      isUndo: true,
    } as IUndoRedoAction);
  }

  sendRedo(command: ICommand): void {
    this.socketService.emit("undoredo:emit", {
      ...this.defaultPayload,
      actionType: ActionType.UndoRedo,
      actionId: command.actionId,
      isUndo: false,
    });
  }

  onShape(): Observable<void> {
    return this.socketService.on("shape:received");
  }

  onSelection(): Observable<void> {
    return this.socketService.on("selection:received");
  }

  onUndoRedo(): Observable<void> {
    return this.socketService.on("undoredo:received");
  }

  handleResponse(payload: IAction): ICommand {
    const command = this.toolFactory.create(payload);
    return command;
  }
}
