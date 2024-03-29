import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISendCoordPayload } from '../model/ISendCoordPayload.model';
import { SocketService } from './chat/socket.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronizeDrawingService {
  x: number;
  y: number;
  constructor(private socket: SocketService) {}

  sendMessage(x_: number, y_: number, state: string, actionId: string): void {
    this.socket.emit('freedraw:emit', {
      x: x_,
      y: y_,
      state,
      actionId,
    } as ISendCoordPayload);
  }

  receiveMessage(): Observable<ISendCoordPayload> {
    return this.socket.on('freedraw:receive');
  }
}
