import { IAction, ISelectionAction } from './../model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Injectable } from '@angular/core';
import { SyncCommand } from './sync/SyncCommand';

export type CollaborationActionData = {
  data: IAction,
  command: ICommand,
  isUndone: boolean
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  private actions: Map<string, Map<string, SyncCommand>>;

  constructor() {
    this.actions = new Map<string, Map<string, SyncCommand>>();
  }

  addUser(userId: string): boolean {
    if (this.userExists(userId)) {
      return false;
    }

    this.actions.set(userId, new Map<string, SyncCommand>());
    return true;
  }

  getUserActions(userId: string): Map<string, SyncCommand> | null {
    const userActions = this.actions.get(userId);
    if (userActions) return userActions
    else return null;
  }

  addCommandToUser(userId: string, command: SyncCommand) {
    if (this.userExists(userId)) {
      this.actions.get(userId)!.set(command.payload.actionId, command);
    }

  }

  undoUserAction(userId: string, actionId: string, isActiveUser: boolean): void {
    if (!this.userExists(userId)) {
      return;
    }
    const action = this.actions.get(userId)!.get(actionId);
    if (action && !isActiveUser) {
      console.log(action.command);
      action.undo();
    }
  }

  redoUserAction(userId: string, actionId: string, isActiveUser: boolean): void {
    if (!this.userExists(userId)) {
      return;
    }

    const action = this.actions.get(userId)!.get(actionId);
    if (action && !isActiveUser) {
      action.redo();
    }
  }

  userExists(userId: string): boolean {
    return this.actions.has(userId);
  }

  updateActionSelection(userId: string, actionId: string, selection: boolean, selectedBy: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      this.actions.get(userId)!.get(actionId)!.isSelected = selection;
      this.actions.get(userId)!.get(actionId)!.selectedBy = selectedBy;
    }
  }

  getSelectionStatus(userId: string, actionId: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      return this.actions.get(userId!)!.get(actionId)!.isSelected;
    } else return true;
  }

  getSelectedByUser(userId: string, actionId: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      return this.actions.get(userId)!.get(actionId)!.selectedBy;
    } else return '';
  }

  getSelectedActionByUserId(userId: string): string | null {
    if (!userId) return null;

    if (this.actions.has(userId)) {
      for (let [userId, actions] of this.actions) {
        for (let [actionId, command] of actions) {
          if (command.isSelected && command.selectedBy === userId) {
            return actionId;
          }
        }
      }
    }

    return null;
  }

  getActionById(actionId: string): SyncCommand | null {
    if (!actionId) return null;

    for (let [userId, actions] of this.actions) {
      const tmp = actions.get(actionId);
      if (tmp) {
        return tmp;
      }
    }

    return null;
  }
}
