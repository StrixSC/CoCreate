import { ResizeSyncCommand } from './sync/resize-sync-command';
import { UndoRedoSyncCommand } from './sync/undoredo-sync-command';
import { TranslateSyncCommand } from './sync/translate-sync-command';
import { DeleteSyncCommand } from './sync/delete-sync-command';
import { RectangleSyncCommand } from './sync/rectangle-sync-command';
import { FreedrawSyncCommand } from './sync/freedraw-sync-command';
import { SyncDrawingService } from './syncdrawing.service';
import { IDeleteAction, ISelectionAction, ITranslateAction, IRotateAction, IResizeAction, IFreedrawUpAction, IFreedrawUpLoadAction, ISaveAction } from './../model/IAction.model';
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
    Freedraw: (payload: IFreedrawAction & IFreedrawUpAction, isActiveUser: boolean) => this.onFreedraw(payload, isActiveUser),
    Select: (payload: ISelectionAction, isActiveUser: boolean) => this.onSelect(payload, isActiveUser),
    Shape: (payload: IShapeAction, isActiveUser: boolean) => this.onShape(payload, isActiveUser),
    Delete: (payload: IDeleteAction, isActiveUser: boolean) => this.onDelete(payload, isActiveUser),
    Translate: (payload: ITranslateAction, isActiveUser: boolean) => this.onTranslate(payload, isActiveUser),
    Rotate: (payload: IRotateAction, isActiveUser: boolean) => this.onRotate(payload, isActiveUser),
    Resize: (payload: IResizeAction, isActiveUser: boolean) => this.onResize(payload, isActiveUser),
    UndoRedo: () => { console.error(Error("Oops UndoRedo Reception Event Handler not implemented yet!")) },
    Layer: () => { console.error(Error("Oops UndoRedo Reception Event Handler not implemented yet!")) },
    Text: () => { console.error(Error("Oops UndoRedo Reception Event Handler not implemented yet!")) },
    Save: (payload: ISaveAction) => this.onSave(payload)
  };

  constructor(
    private rendererService: RendererProviderService,
    private drawingService: DrawingService,
    private selectionService: SelectionToolService,
    private collaborationService: CollaborationService,
    private syncService: SyncDrawingService,
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

  addOrUpdateCollaboration(command: SyncCommand, addToUndos: boolean) {
    this.collaborationService.addUser(command.payload.userId);
    this.collaborationService.addCommandToUser(command.payload.userId, command, addToUndos);
    this.pendingActions.delete(command.payload.actionId);
  }

  onFreedraw(payload: IFreedrawAction & IFreedrawUpAction, isActiveUser: boolean) {
    const state = payload.state;
    let command: FreedrawSyncCommand | undefined;
    const addToUndos = !payload.isUndoRedo && isActiveUser;

    switch (state) {
      case DrawingState.down:
        command = new FreedrawSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
        command.execute();
        this.pendingActions.set(payload.actionId, command);
        break;

      case DrawingState.move:
        command = this.pendingActions.get(payload.actionId) as FreedrawSyncCommand;
        command!.update(payload);
        break;

      case DrawingState.up:
        command = this.pendingActions.get(payload.actionId) as FreedrawSyncCommand;
        if (command) {
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        } else {
          command = new FreedrawSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
          command.isFlatAction = true;
          const res = command.execute();
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        }
        break;
    }
  }

  onDelete(payload: IDeleteAction, isActiveUser: boolean) {
    const drawnAction = this.collaborationService.getActionById(payload.selectedActionId);
    const addToUndos = false;
    const command = new DeleteSyncCommand(payload, this.drawingService, drawnAction);
    const res = command.execute();
    if (res) {
      this.addOrUpdateCollaboration(res, addToUndos);
    }
  }

  onShape(payload: IShapeAction, isActiveUser: boolean) {
    const shapeType = payload.shapeType;
    const state = payload.state;
    let command: EllipseSyncCommand | RectangleSyncCommand;

    switch (state) {
      case DrawingState.down:
        command = shapeType === ShapeType.Ellipse
          ? new EllipseSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService)
          : new RectangleSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService)

        command.execute();
        this.pendingActions.set(payload.actionId, command);
        break;

      case DrawingState.move:
        command = this.pendingActions.get(payload.actionId) as EllipseSyncCommand | RectangleSyncCommand;
        command!.update(payload);
        break;

      case DrawingState.up:
        const addToUndos = !payload.isUndoRedo && isActiveUser;
        command = this.pendingActions.get(payload.actionId) as EllipseSyncCommand | RectangleSyncCommand;
        if (!command) {
          command = shapeType === ShapeType.Ellipse
            ? new EllipseSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService)
            : new RectangleSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService)
          command.isFlatAction = true;
          const res = command.execute();
          if (res) {
            this.addOrUpdateCollaboration(command, addToUndos);
          }
        } else {
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        }
        break;
    }
  }

  onTranslate(payload: ITranslateAction, isActiveUser: boolean): void {
    const state = payload.state;
    let hasOngoingMovement: boolean = false;
    const addToUndos = isActiveUser && !payload.isUndoRedo;

    switch (state) {
      case DrawingState.down:
        break;

      case DrawingState.move:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (!hasOngoingMovement) {
          const command = new TranslateSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
          command.execute();
          this.pendingActions.set(payload.actionId, command);
        } else {
          if (payload.isUndoRedo) {
            const command = new TranslateSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
            command.isFlatAction = true;
            const res = command.execute();
            if (res) {
              this.addOrUpdateCollaboration(res, addToUndos);
            }
          } else {
            const command = this.pendingActions.get(payload.actionId);
            command!.update(payload);
          }
        }
        break;

      case DrawingState.up:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (hasOngoingMovement) {
          const command = this.pendingActions.get(payload.actionId);
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        }
        break;
    }

  }

  private onRotate(payload: IRotateAction, isActiveUser: boolean) {
    let hasOngoingMovement: boolean = false;
    const addToUndos = isActiveUser && !payload.isUndoRedo;
    const state = payload.state;
    payload.angle = payload.angle * 180 / Math.PI;
    switch (state) {
      case DrawingState.down:
        const command = new RotateSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
        const res = command.execute();
        if (res) {
          this.addOrUpdateCollaboration(res, false);
        }
        break;

      case DrawingState.move:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (!hasOngoingMovement) {
          const command = new RotateSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
          command.execute();
          this.pendingActions.set(payload.actionId, command);
        } else {
          if (payload.isUndoRedo) {
            const command = new RotateSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
            command.isFlatAction = true;
            const res = command.execute();
            if (res) {
              this.addOrUpdateCollaboration(res, addToUndos);
            }
          } else {
            const command = this.pendingActions.get(payload.actionId);
            command!.update(payload);
          }
        }
        break;

      case DrawingState.up:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (hasOngoingMovement) {
          const command = this.pendingActions.get(payload.actionId);
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        }
        break;
    }

    if (isActiveUser && !payload.isUndoRedo) {
      this.selectionService.setSelection();
    }

  }

  onSave(payload: ISaveAction) {
    if (!payload.isUndoRedo) {
      this.syncService.sendSelect(this.selectionService.selectedActionId, false);
      this.syncService.sendSelect(payload.actionId, true);
    }
  }

  onResize(payload: IResizeAction, isActiveUser: boolean) {
    let hasOngoingMovement: boolean = false;
    const addToUndos = false;
    const state = payload.state;
    switch (state) {
      case DrawingState.down:
        const command = new ResizeSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
        const res = command.execute();
        if (res) {
          this.addOrUpdateCollaboration(res, false);
        }
        break;

      case DrawingState.move:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (!hasOngoingMovement) {
          const command = new ResizeSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
          command.execute();
          this.pendingActions.set(payload.actionId, command);
        } else {
          if (payload.isUndoRedo) {
            const command = new ResizeSyncCommand(payload, this.rendererService.renderer, this.drawingService, this.syncService);
            command.isFlatAction = true;
            const res = command.execute();
            if (res) {
              this.addOrUpdateCollaboration(res, addToUndos);
            }
          } else {
            const command = this.pendingActions.get(payload.actionId);
            command!.update(payload);
          }
        }
        break;

      case DrawingState.up:
        hasOngoingMovement = this.pendingActions.has(payload.actionId);
        if (hasOngoingMovement) {
          const command = this.pendingActions.get(payload.actionId);
          const res = command!.update(payload);
          if (res) {
            this.addOrUpdateCollaboration(res, addToUndos);
          }
        }
        break;
    }
  }

  deleteAll(): void {
    this.collaborationService.clearActionList();
  }

  onSelect(payload: ISelectionAction, isActiveUser: boolean) {
    if (payload.isSelected && payload.selectedBy === this.syncService.defaultPayload!.userId) {
      this.selectionService.selectByActionId(payload.actionId, payload.username);
    } else if (payload.isSelected) {
      this.drawingService.renderSelectionIndicator(payload.actionId, true);
    } else if (!payload.isSelected) {
      this.drawingService.renderSelectionIndicator(payload.actionId, false);
    }

    this.collaborationService.updateActionSelection(payload.userId, payload.actionId, payload.isSelected, payload.selectedBy || '');
  }
}
