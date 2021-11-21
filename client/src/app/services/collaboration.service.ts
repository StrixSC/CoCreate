import { IAction, ISelectionAction } from './../model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Injectable } from '@angular/core';
import { SyncCommand } from './sync/sync-command';

export interface ActionData {
  commands: SyncCommand[],
  undoneCommands: SyncCommand[],
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  private actions: Map<string, ActionData>;

  constructor() {
    this.actions = new Map<string, ActionData>();
  }

  addUser(userId: string): boolean {
    if (this.userExists(userId)) {
      return false;
    }

    this.actions.set(userId, { commands: [], undoneCommands: [] });
    return true;
  }

  getUserActions(userId: string): SyncCommand[] | null {
    const userActions = this.actions.get(userId);
    if (userActions) return userActions.commands;
    else return null;
  }

  addCommandToUser(userId: string, command: SyncCommand) {
    if (this.userExists(userId)) {
      this.actions.get(userId)!.commands.push(command);
      this.actions.get(userId)!.undoneCommands = [];
    }

  }

  undoUserAction(userId: string): SyncCommand | void {
    if (this.canUndo(userId)) {
      const undoneCommand = this.actions.get(userId)!.commands.pop();
      undoneCommand!.undo();
      this.actions.get(userId)!.undoneCommands.push(undoneCommand!);
      return undoneCommand;
    }

  }

  redoUserAction(userId: string): SyncCommand | void {
    if (this.canRedo(userId)) {
      const redoneCommand = this.actions.get(userId)!.undoneCommands.pop();
      redoneCommand!.redo();
      this.actions.get(userId)!.commands.push(redoneCommand!);
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
      const tmp = Array().concat(actionDatas.commands, actionDatas.undoneCommands).find((c) => c.payload.actionId === actionId);
      if (tmp) {
        return tmp;
      }

    }

    return null;
  }

  canUndo(userId: string): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    return this.actions.get(userId)!.commands.length > 0;
  }

  canRedo(userId: string): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    return this.actions.get(userId)!.undoneCommands.length > 0;
  }
}
