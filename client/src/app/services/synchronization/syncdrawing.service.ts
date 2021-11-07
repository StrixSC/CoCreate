import { ToolFactoryService } from './tool-factory.service';
import { IAction, ActionType } from './../../model/IAction.model';
import { IDefaultActionPayload } from '../../model/IAction.model';
import { Injectable } from '@angular/core';
import { SocketService } from '../chat/socket.service';

@Injectable({
  providedIn: 'root'
})
export class SyncDrawingService {
  defaultPayload: IDefaultActionPayload | null;
  
  constructor(private socketService: SocketService, private toolFactory: ToolFactoryService) {
    this.defaultPayload = null;
  }

  onDown(): void {
    if(!this.defaultPayload) {
      return;
    }
  }

  onUp(): void {
    if(!this.defaultPayload) {
      return;
    }
  }

  onMove(): void {
    if(!this.defaultPayload) {
      return;
    }
  }

  handleResponse(payload: IAction): void {
    const command = this.toolFactory.create(payload);
    return command.execute();
  }
}
