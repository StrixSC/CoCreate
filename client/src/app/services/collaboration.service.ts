import { IAction, ISelectionAction } from './../model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  private actions: Map<string, Map<string, { data: IAction, command: ICommand, isUndone: boolean }>>;

  constructor() {
    this.actions = new Map<string, Map<string, { data: IAction, command: ICommand, isUndone: boolean }>>();
  }

  addUser(userId: string): boolean {
    if (this.userExists(userId)) {
      return false;
    }

    this.actions.set(userId, new Map<string, { data: IAction, command: ICommand, isUndone: boolean }>());
    return true;
  }

  getUserActions(userId: string): Map<string, { data: IAction, command: ICommand, isUndone: boolean }> | null {
    const userActions = this.actions.get(userId);
    if (userActions) return userActions
    else return null;
  }

  addActionToUser(userId: string, action: { data: IAction, command: ICommand, isUndone: boolean }) {
    if (this.userExists(userId)) {
      this.actions.get(userId)!.set(action.data.actionId, action);
    }

  }

  undoUserAction(userId: string, actionId: string): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.actions.get(userId)!.get(actionId);
    if (action && action.isUndone === false) {
      action.command.undo();
      action.isUndone = true;
      return true;
    } else {
      return false;
    }
  }

  redoUserAction(userId: string, actionId: string): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.actions.get(userId)!.get(actionId);
    if (action && action.isUndone === true) {
      action.command.execute();
      action.isUndone = false;
      return true;
    } else {
      return false;
    }
  }

  userExists(userId: string): boolean {
    return this.actions.has(userId);
  }

  updateActionSelection(userId: string, actionId: string, selection: boolean) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      (this.actions.get(userId)!.get(actionId)!.data as ISelectionAction).isSelected = selection;
    }
  }

  getSelectionStatus(userId: string, actionId: string) {
    return (this.actions.get(userId!)!.get(actionId)!.data as ISelectionAction).isSelected;
  }

}
