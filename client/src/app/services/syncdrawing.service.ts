import { AuthService } from './auth.service';
import { FilledShape } from "./tools/tool-rectangle/filed-shape.model";
import {
  IUndoRedoAction,
  IShapeAction,
  ShapeType,
  ShapeStyle,
  ISelectionAction,
} from "./../model/IAction.model";
import { fromRGB, fromOpacity } from "../utils/colors";
import { Pencil } from "./tools/pencil-tool/pencil.model";
import { Observable } from "rxjs";
import {
  DrawingState,
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

  private totalXTranslation = 0;
  private totalYTranslation = 0;
  private currentXScale = 0;
  private currentYScale = 0;
  private totalAngle = 0;

  public activeActionId: string = "";
  private hasStartedMovement: boolean = false;

  constructor(
    private auth: AuthService,
    private socketService: SocketService
  ) {
    this.defaultPayload = null;
  }

  updatedDefaultPayload(collaborationId: string): void {
    this.defaultPayload = {
      userId: this.auth.activeUser!.uid,
      collaborationId: collaborationId,
      username: this.auth.activeUser!.displayName!
    } as IDefaultActionPayload
  }

  onFreedraw(): Observable<any> {
    return this.socketService.on("freedraw:received");
  }

  sendFreedraw(state: DrawingState, pencil: Pencil, isUndoRedo?: boolean, actionId?: string) {
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

    if (actionId) {
      this.activeActionId = actionId
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
      selectedBy: this.defaultPayload.userId,
      isUndoRedo: !!isUndoRedo,
    } as IDefaultActionPayload & IFreedrawUpAction;

    const lastPoint = pencil.pointsList[pencil.pointsList.length - 1];

    payload.x = lastPoint.x;
    payload.y = lastPoint.y;

    if (state === DrawingState.up) {
      payload.isSelected = false;
      payload.offsets = pencil.pointsList;
    }

    this.socketService.emit("freedraw:emit", payload);
  }

  sendShape(
    state: DrawingState,
    shapeStyle: ShapeStyle,
    shapeType: ShapeType,
    shape: FilledShape,
    isUndoRedo?: boolean,
    actionId?: string
  ) {
    if (!this.defaultPayload || !shapeType || !shape) {
      return;
    }

    let rgb = [0, 0, 0];
    let fillRgb = [0, 0, 0];

    let alpha = 255;
    let fillAlpha = 255;

    if (state === DrawingState.down) {
      this.activeActionId = v4();
    }

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

    if (actionId) {
      this.activeActionId = actionId
    }

    let payload: IShapeAction = {
      ...this.defaultPayload,
      actionId: this.activeActionId,
      x: shape.x,
      y: shape.y,
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
      selectedBy: this.defaultPayload.userId,
      shapeStyle: shapeStyle,
      actionType: ActionType.Shape,
      isUndoRedo: !!isUndoRedo,
    };

    if (state === DrawingState.up) {
      payload.isSelected = false;
    }

    this.socketService.emit("shape:emit", payload);
  }

  sendUndo(): void {
    this.socketService.emit("undoredo:emit", {
      ...this.defaultPayload,
      actionType: ActionType.UndoRedo,
      actionId: v4(),
      isUndo: true,
    } as IUndoRedoAction);
  }

  sendRedo(): void {
    this.socketService.emit("undoredo:emit", {
      ...this.defaultPayload,
      actionType: ActionType.UndoRedo,
      actionId: v4(),
      isUndo: false,
    });
  }

  sendSelect(actionId: string, selection: boolean, isUndoRedo?: boolean): void {
    if (!actionId) return;
    this.socketService.emit("selection:emit", {
      ...this.defaultPayload,
      actionId: actionId,
      actionType: ActionType.Select,
      isSelected: selection,
      isUndoRedo: !!isUndoRedo
    } as ISelectionAction);
  }

  sendRotate(state: DrawingState, selectedActionId: string, angle: number, isUndoRedo?: boolean) {
    if (!selectedActionId) {
      return;
    }

    if (state === DrawingState.move && !this.hasStartedMovement) {
      this.activeActionId = v4();
      this.hasStartedMovement = true;
      this.resetScalings();
    } else if (state === DrawingState.up && this.hasStartedMovement) {
      this.hasStartedMovement = false;
    } else if (state === DrawingState.move && this.hasStartedMovement) {
      this.totalAngle += angle;
    }

    const payload = {
      ...this.defaultPayload,
      actionType: ActionType.Rotate,
      actionId: this.activeActionId,
      selectedActionId,
      state,
      angle,
      isUndoRedo: !!isUndoRedo
    }

    if (state === DrawingState.up && !isUndoRedo) {
      payload.angle = this.totalAngle;
      this.resetScalings();
    }

    this.socketService.emit('rotation:emit', payload);
  }

  sendTranslate(state: DrawingState, selectedActionId: string, xTranslate: number, yTranslate: number, isUndoRedo?: boolean) {
    if (!selectedActionId) {
      return;
    }
    if (state === DrawingState.move && !this.hasStartedMovement) {
      this.activeActionId = v4();
      this.hasStartedMovement = true;
    } else if (state === DrawingState.up && this.hasStartedMovement) {
      this.hasStartedMovement = false;
    } else if (state === DrawingState.move && this.hasStartedMovement) {
      this.totalXTranslation += xTranslate;
      this.totalYTranslation += yTranslate;
    }

    if (isUndoRedo) {
      this.hasStartedMovement = false;
      this.activeActionId = v4();
    }

    const payload = {
      ...this.defaultPayload,
      actionType: ActionType.Translate,
      actionId: this.activeActionId,
      selectedActionId,
      state,
      xTranslation: xTranslate,
      yTranslation: yTranslate,
      isUndoRedo: !!isUndoRedo,
    }

    if (state === DrawingState.up && !isUndoRedo) {
      payload.xTranslation = this.totalXTranslation;
      payload.yTranslation = this.totalYTranslation;
      this.resetScalings();
    }

    this.socketService.emit('translation:emit', payload);
  }

  sendDelete(actionId: string, isUndoRedo?: boolean): void {
    if (!actionId) return;

    const payload = {
      ...this.defaultPayload,
      actionId: v4(),
      selectedActionId: actionId,
      actionType: ActionType.Delete,
      isUndoRedo: !!isUndoRedo,
    }

    this.socketService.emit('delete:emit', payload);
  }

  sendResize(state: DrawingState, actionId: string, xScale: number, yScale: number, xTranslation: number, yTranslation: number, isUndoRedo?: boolean) {
    if (!actionId) return;

    if (state === DrawingState.down || isUndoRedo) {

      this.activeActionId = v4();
    }

    const payload = {
      ...this.defaultPayload,
      actionType: ActionType.Resize,
      actionId: this.activeActionId,
      selectedActionId: actionId,
      xScale,
      yScale,
      xTranslation,
      yTranslation,
      state,
      isUndoRedo: !!isUndoRedo
    }

    if (state === DrawingState.move) {
      this.currentXScale = xScale;
      this.currentYScale = yScale;
      this.totalXTranslation = xTranslation;
      this.totalYTranslation = yTranslation;
    } else if (state === DrawingState.up && !isUndoRedo) {
      payload.xScale = this.currentXScale;
      payload.yScale = this.currentYScale;
      payload.xTranslation = this.totalXTranslation;
      payload.yTranslation = this.totalYTranslation;
      this.resetScalings();
    }

    this.socketService.emit('resize:emit', payload);
  }

  resetScalings(): void {
    this.currentXScale = 0;
    this.totalXTranslation = 0;
    this.totalYTranslation = 0;
    this.currentYScale = 0;
    this.totalAngle = 0;
  }

  sendPostSaveSelect(data: { collaborationId: string, actionId: string }) {
    this.sendSelect(data.actionId, true);
  }

  onShape(): Observable<any> {
    return this.socketService.on("shape:received");
  }

  onSelection(): Observable<any> {
    return this.socketService.on("selection:received");
  }

  onUndoRedo(): Observable<any> {
    return this.socketService.on("undoredo:received");
  }

  onDelete(): Observable<any> {
    return this.socketService.on('delete:received');
  }

  onTranslate(): Observable<any> {
    return this.socketService.on('translation:received');
  }

  onRotate(): Observable<any> {
    return this.socketService.on('rotation:received');
  }

  onResize(): Observable<any> {
    return this.socketService.on('resize:received');
  }

  onText(): Observable<any> {
    return this.socketService.on('text:received');
  }

  onLayer(): Observable<any> {
    return this.socketService.on('layer:received');
  }

  onActionSave(): Observable<any> {
    return this.socketService.on('action:saved');
  }

}
