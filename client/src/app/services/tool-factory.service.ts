import { UndoRedoSyncCommand } from './sync/UndoRedoSyncCommand';
import { TranslateSyncCommand } from './sync/TranslateSyncCommand';
import { DeleteSyncCommand } from './sync/DeleteSyncCommand';
import { RectangleSyncCommand } from './sync/RectangleSyncCommand';
import { FreedrawSyncCommand } from './sync/FreedrawSyncCommand';
import { DeleteCommand } from './tools/selection-tool/delete-command/delete-command';
import { RotateTranslateCompositeCommand } from './tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { TranslateCommand } from './tools/selection-tool/translate-command/translate-command';
import { SyncDrawingService } from './syncdrawing.service';
import { IDeleteAction, ISelectionAction, ITranslateAction, IResizePayload } from './../model/IAction.model';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { EllipseCommand } from './tools/tool-ellipse/ellipse-command';
import { setStyle } from "src/app/utils/colors";
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
  DrawingState,
  IUndoRedoAction,
  ShapeType,
} from "../model/IAction.model";
import { Injectable } from "@angular/core";
import { Pencil } from "./tools/pencil-tool/pencil.model";
import { PencilCommand } from "./tools/pencil-tool/pencil-command";
import { RendererProviderService } from "./renderer-provider/renderer-provider.service";
import { SyncCommand } from './sync/SyncCommand';
import { EllipseSyncCommand } from './sync/EllipseSyncCommand';

export interface ISavedUserAction {
  command: SyncCommand;
}

@Injectable({
  providedIn: "root",
})
export class ToolFactoryService {
  private pendingActions: Map<string, SyncCommand> = new Map();

  tools: Record<ActionType | string, (payload: IAction, isActiveUser?: boolean) => any> = {
    Freedraw: (payload: IFreedrawAction, isActiveUser: boolean) => {
      const state = payload.state;
      if (state === DrawingState.down) {
        const command = new FreedrawSyncCommand(isActiveUser, payload, this.rendererService.renderer, this.drawingService);
        command.execute();
        this.pendingActions.set(payload.actionId, command);
      } else {
        const command = this.pendingActions.get(payload.actionId);
        const res = command!.update(payload);
        if (res) {
          this.addOrUpdateCollaboration(res);
        }
      }
    },
    Select: (payload: ISelectionAction) => {
      if (payload.isSelected && payload.selectedBy === this.syncService.defaultPayload!.userId) {
        this.selectionService.selectByActionId(payload.actionId);
      }

      this.collaborationService.updateActionSelection(payload.userId, payload.actionId, payload.isSelected, payload.selectedBy || '');
    },
    Shape: (payload: IShapeAction, isActiveUser: boolean) => {
      const shapeType = payload.shapeType;
      const state = payload.state;
      if (state === DrawingState.down) {
        const command = shapeType === ShapeType.Ellipse
          ? new EllipseSyncCommand(isActiveUser, payload, this.rendererService.renderer, this.drawingService)
          : new RectangleSyncCommand(isActiveUser, payload, this.rendererService.renderer, this.drawingService)

        command.execute();
        this.pendingActions.set(payload.actionId, command);

      } else {
        const command = this.pendingActions.get(payload.actionId);
        const res = command!.update(payload);
        if (res) {
          this.addOrUpdateCollaboration(res);
        }
      }

    },
    Delete: (payload: IDeleteAction, isActiveUser: boolean) => {
      const command = new DeleteSyncCommand(isActiveUser, payload, this.drawingService);
      const res = command.execute();
      if (res) {
        this.addOrUpdateCollaboration(res);
      }
    },
    Translate: (payload: ITranslateAction, isActiveUser: boolean) => {
      const state = payload.state;
      const hasOngoingMovement = this.pendingActions.has(payload.actionId);
      if (!hasOngoingMovement) {
        const command = new TranslateSyncCommand(isActiveUser, payload, this.rendererService.renderer, this.drawingService);
        command.execute();
        this.pendingActions.set(payload.actionId, command);
      } else {
        const command = this.pendingActions.get(payload.actionId);
        const res = command!.update(payload);
        if (res) {
          this.addOrUpdateCollaboration(res);
        }
      }
    },
    Rotate: () => {
      return;
    },
    Resize: () => {
      return;
    },
    UndoRedo: (payload: IUndoRedoAction, isActiveUser: boolean) => {
      const command = new UndoRedoSyncCommand(payload, this.collaborationService, isActiveUser);
      command.execute();
    },
    Layer: () => {
      return;
    },
    Text: () => {
      return
    },
    Save: (payload: { collaborationId: string, actionId: string, userId: string, actionType: string }) => {
      this.syncService.sendSelect(this.selectionService.selectedActionId, false);
      this.syncService.sendSelect(payload.actionId, true);
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
      const isActiveUser = payload.userId === this.syncService.defaultPayload!.userId;
      return callback(payload, isActiveUser);
    } else return null;
  }

  handleEvent(payload: IAction): ICommand | null {
    return this.create(payload);
  }

  addOrUpdateCollaboration(command: SyncCommand) {
    this.collaborationService.addUser(command.payload.userId);
    this.collaborationService.addCommandToUser(command.payload.userId, command);
    this.pendingActions.delete(command.payload.actionId);
  }
}
