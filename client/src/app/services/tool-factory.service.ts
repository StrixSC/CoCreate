import { ResizeSyncCommand } from './sync/resize-sync-command';
import { UndoRedoSyncCommand } from './sync/undoredo-sync-command';
import { TranslateSyncCommand } from './sync/translate-sync-command';
import { DeleteSyncCommand } from './sync/delete-sync-command';
import { RectangleSyncCommand } from './sync/rectangle-sync-command';
import { FreedrawSyncCommand } from './sync/freedraw-sync-command';
import { SyncDrawingService } from './syncdrawing.service';
import { IDeleteAction, ISelectionAction, ITranslateAction, IRotateAction, IResizeAction, IFreedrawUpAction, IFreedrawUpLoadAction } from './../model/IAction.model';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { CollaborationService } from "./collaboration.service";
import { ICommand } from "src/app/interfaces/command.interface";
import { DrawingService } from "src/app/services/drawing/drawing.service";
import {
  IShapeAction,
  ActionType,
  IAction,
  IFreedrawAction,
  DrawingState,
  IUndoRedoAction,
  ShapeType,
} from "../model/IAction.model";
import { Injectable } from "@angular/core";
import { RendererProviderService } from "./renderer-provider/renderer-provider.service";
import { SyncCommand } from './sync/sync-command';
import { EllipseSyncCommand } from './sync/ellipse-sync-command';
import { RotateSyncCommand } from './sync/rotate-sync-command';

export interface ISavedUserAction {
  command: SyncCommand;
}

@Injectable({
  providedIn: "root",
})
export class ToolFactoryService {
  private pendingActions: Map<string, SyncCommand> = new Map();

  tools: Record<ActionType | string, (payload: IAction, isActiveUser?: boolean) => any> = {
    Freedraw: (payload: IFreedrawAction & IFreedrawUpLoadAction & IFreedrawUpAction) => {
      const state = payload.state;
      if (payload.isUndoRedo) {
        const command = new FreedrawSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
        const res = command.execute();
        if (res) {
          this.addOrUpdateCollaboration(command);
        }
      } else {
        if (state === DrawingState.down) {
          const command = new FreedrawSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
          command.execute();
          this.pendingActions.set(payload.actionId, command);
        } else {
          const command = this.pendingActions.get(payload.actionId);
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res);
          }
        }
      }
    },
    Select: (payload: ISelectionAction) => {
      if (payload.isSelected && payload.selectedBy === this.syncService.defaultPayload!.userId) {
        this.selectionService.selectByActionId(payload.actionId, payload.username);
      } else if (payload.isSelected) {
        this.drawingService.renderSelectionIndicator(payload.actionId, true);
      } else if (!payload.isSelected) {
        this.drawingService.renderSelectionIndicator(payload.actionId, false);
      }

      this.collaborationService.updateActionSelection(payload.userId, payload.actionId, payload.isSelected, payload.selectedBy || '');
    },
    Shape: (payload: IShapeAction) => {
      const shapeType = payload.shapeType;
      const state = payload.state;
      if (state === DrawingState.down) {
        const command = shapeType === ShapeType.Ellipse
          ? new EllipseSyncCommand(payload, this.rendererService.renderer, this.drawingService)
          : new RectangleSyncCommand(payload, this.rendererService.renderer, this.drawingService)

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
    Delete: (payload: IDeleteAction) => {
      const command = new DeleteSyncCommand(payload, this.drawingService);
      const res = command.execute();
      if (res && !payload.isUndoRedo) {
        this.addOrUpdateCollaboration(res);
      }
    },
    Translate: (payload: ITranslateAction) => {
      const hasOngoingMovement = this.pendingActions.has(payload.actionId);
      if (!hasOngoingMovement) {
        const command = new TranslateSyncCommand(payload, this.rendererService.renderer, this.drawingService);
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
    Rotate: (payload: IRotateAction, isActiveUser: boolean) => {
      if (payload.state === DrawingState.down) {
        const command = new RotateSyncCommand(payload, this.rendererService.renderer, this.drawingService);
        const res = command.execute();
        if (res) {
          this.addOrUpdateCollaboration(res);
        }
      } else {
        const hasOngoingMovement = this.pendingActions.has(payload.actionId);
        payload = { ...payload, angle: payload.angle * 180 / Math.PI }
        if (!hasOngoingMovement) {
          const command = new RotateSyncCommand(payload, this.rendererService.renderer, this.drawingService);
          command.execute();
          this.pendingActions.set(payload.actionId, command);
        } else {
          const command = this.pendingActions.get(payload.actionId);
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res);
          }
        }
      }

      if (isActiveUser) {
        this.selectionService.setSelection();
      }

    },
    Resize: (payload: IResizeAction) => {
      const hasOngoingMovement = this.pendingActions.has(payload.actionId);
      if (!hasOngoingMovement) {
        const command = new ResizeSyncCommand(payload, this.rendererService.renderer, this.drawingService);
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
    UndoRedo: (payload: IUndoRedoAction) => {
      const command = new UndoRedoSyncCommand(payload, this.collaborationService, this.syncService);
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
