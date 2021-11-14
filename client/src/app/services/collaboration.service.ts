import { IAction, ISelectionAction } from './../model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Injectable } from '@angular/core';

export type CollaborationActionData = { data: IAction, command: ICommand, isUndone: boolean }
@Injectable({
  providedIn: 'root'
})
export class CollaborationService {

  private actions: Map<string, Map<string, CollaborationActionData>>;

  constructor() {
    this.actions = new Map<string, Map<string, CollaborationActionData>>();
  }

  addUser(userId: string): boolean {
    if (this.userExists(userId)) {
      return false;
    }

    this.actions.set(userId, new Map<string, CollaborationActionData>());
    return true;
  }

  getUserActions(userId: string): Map<string, CollaborationActionData> | null {
    const userActions = this.actions.get(userId);
    if (userActions) return userActions
    else return null;
  }

  addActionToUser(userId: string, action: CollaborationActionData) {
    if (this.userExists(userId)) {
      this.actions.get(userId)!.set(action.data.actionId, action);
    }

  }

  undoUserAction(userId: string, actionId: string, isActiveUser: boolean): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.actions.get(userId)!.get(actionId);
    if (action && action.isUndone === false) {
      if (!isActiveUser) {
        action.command.undo();
      }
      action.isUndone = true;
      return true;
    } else {
      return false;
    }
  }

  redoUserAction(userId: string, actionId: string, isActiveUser: boolean): boolean {
    if (!this.userExists(userId)) {
      return false;
    }

    const action = this.actions.get(userId)!.get(actionId);
    if (action && action.isUndone === true) {
      if (!isActiveUser) {
        action.command.execute();
      }
      action.isUndone = false;
      return true;
    } else {
      return false;
    }
  }

  userExists(userId: string): boolean {
    return this.actions.has(userId);
  }

  updateActionSelection(userId: string, actionId: string, selection: boolean, selectedBy: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      (this.actions.get(userId)!.get(actionId)!.data as ISelectionAction).isSelected = selection;
      (this.actions.get(userId)!.get(actionId)!.data as ISelectionAction).selectedBy = selectedBy;

    }
  }

  getSelectionStatus(userId: string, actionId: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      return (this.actions.get(userId!)!.get(actionId)!.data as ISelectionAction).isSelected;
    } else return true;
  }

  getSelectedByUser(userId: string, actionId: string) {
    if (this.actions.has(userId) && this.actions.get(userId)!.has(actionId)) {
      return (this.actions.get(userId)!.get(actionId)!.data as ISelectionAction).selectedBy;
    } else return '';
  }

  getSelectedActionByUserId(userId: string): string | null {
    if (!userId) return null;
    let actionId = null;

    if (this.actions.has(userId)) {
      this.actions.forEach((user) => {
        user.forEach((action) => {
          if (action.data && (action.data as ISelectionAction).selectedBy) {
            if ((action.data as ISelectionAction).selectedBy === userId) {
              actionId = action.data.actionId;
            }
          }
        })
      })
    }

    return actionId;
  }

  getActionById(actionId: string): CollaborationActionData | null {
    if (!actionId) return null;
    let actionData = null;

    this.actions.forEach((user) => {
      const tmp = user.get(actionId);
      if (tmp) {
        actionData = tmp;
      }
    });

    return actionData;
  }

  // Finds the latest not-undone user action. 
  findLatestAction(userId: string): CollaborationActionData | null {
    if (!userId) return null;

    const user = this.actions.get(userId);
    if (user) {
      for (let action of Array.from(user).reverse()) {
        if (!action[1].isUndone) {
          return action[1];
        }
      }
    }

    return null;
  }

  // Finds the latest not-undone user action. 
  findLatestUndoneAction(userId: string): CollaborationActionData | null {
    if (!userId) return null;

    const user = this.actions.get(userId);
    if (user) {
      for (let action of Array.from(user).reverse()) {
        console.log(action);
        if (action[1].isUndone) {
          return action[1];
        }
      }
    }

    return null;
  }

  setUndone(userId: string, actionId: string): boolean {
    const hasAction = (this.actions.has(userId) && this.actions.get(userId)!.has(actionId));
    if (hasAction) {
      this.actions.get(userId)!.get(actionId)!.isUndone = true;

      return true;
    } else return false;
  }

}
