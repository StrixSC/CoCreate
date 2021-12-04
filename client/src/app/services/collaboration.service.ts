import { ResizeSyncCommand } from './sync/resize-sync-command';
import { RotateSyncCommand } from './sync/rotate-sync-command';
import { TranslateSyncCommand } from './sync/translate-sync-command';
import { IAction, ISelectionAction, ITranslateAction, IRotateAction, IResizeAction } from './../model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Injectable } from '@angular/core';
import { SyncCommand } from './sync/sync-command';

export interface ActionData {
  commands: SyncCommand[],
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  private actions: Map<string, ActionData>;
  private undos: SyncCommand[] = [];
  private redos: SyncCommand[] = [];

  constructor() {
    this.actions = new Map<string, ActionData>();
  }

  clearActionList(): void {
    this.undos = [];
    this.redos = [];
    this.actions.clear();
  }

  addUser(userId: string): boolean {
    if (this.userExists(userId)) {
      return false;
    }

    this.actions.set(userId, { commands: [] });
    return true;
  }

  getUserActions(userId: string): SyncCommand[] | null {
    const userActions = this.actions.get(userId);
    if (userActions) return userActions.commands;
    else return null;
  }

  addCommandToUser(userId: string, command: SyncCommand, addToUndos: boolean) {
    if (this.userExists(userId)) {
      this.actions.get(userId)!.commands.push(command);
      if (addToUndos) {
        this.undos.push(command);
        this.redos = [];
      }
    }

  }

  undoUserAction(): SyncCommand | void {
    if (this.canUndo()) {
      const undoneCommand = this.undos.pop();
      undoneCommand!.undo();
      this.redos.push(undoneCommand!);
      return undoneCommand;
    }

  }

  redoUserAction(): SyncCommand | void {
    if (this.canRedo()) {
      const redoneCommand = this.redos.pop();
      redoneCommand!.redo();
      this.undos.push(redoneCommand!);
      return redoneCommand;
    }
  }

  userExists(userId: string): boolean {
    return this.actions.has(userId);
  }

  updateActionSelection(userId: string, actionId: string, selection: boolean, selectedBy: string) {
    if (!this.userExists(userId)) {
      return;
    }

    const action = this.getActionById(actionId);
    if (action) {
      action.isSelected = selection;
      action.selectedBy = selectedBy;
    }
  }

  getSelectionStatus(userId: string, actionId: string): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.getActionById(actionId);

    if (action) {
      return action.isSelected;
    }

    return false;
  }

  getSelectedByUser(userId: string, actionId: string) {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.getActionById(actionId);

    if (action) {
      return action.selectedBy;
    }

    return false;
  }

  isSelectedByUser(userId: string, actionId: string, selectedByUser: string): boolean {
    const selectedBy = this.getSelectedByUser(userId, actionId);
    if (selectedBy === selectedByUser) {
      return true;
    } else return false;
  }

  getSelectedActionByUserId(userId: string): string | null {
    if (!userId && this.userExists(userId)) return null;

    for (let [userId, actionDatas] of this.actions) {
      for (let command of actionDatas.commands) {
        if (command.isSelected && command.selectedBy === userId) {
          return command.payload.actionId;
        }
      }
    }

    return null;
  }

  getActionById(actionId: string): SyncCommand | null {
    if (!actionId) return null;

    for (let [userId, actionDatas] of this.actions) {
      const tmp = actionDatas.commands.find((c) => c.payload.actionId === actionId);
      if (tmp) {
        return tmp;
      }

    }

    return null;
  }

  findTransformations(actionId: string): SyncCommand[] {
    let transformations: SyncCommand[] = [];
    for (let [userId, actionDatas] of this.actions) {
      const tmp = actionDatas.commands.filter((c) => {
        if (c instanceof TranslateSyncCommand || c instanceof RotateSyncCommand || c instanceof ResizeSyncCommand) {
          return c.payload.selectedActionId === actionId
        } else return false;
      })
      transformations = Array().concat(transformations, tmp);
    }

    return transformations;
  }

  canUndo(): boolean {
    return this.undos.length > 0;
  }

  canRedo(): boolean {
    return this.redos.length > 0;
  }
}
