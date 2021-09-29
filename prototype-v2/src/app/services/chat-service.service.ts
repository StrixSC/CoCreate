import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';
import { ISendMessagePayload } from '../models/ISendMessagePayload.model';
import { IStdResponse } from '../models/IStdResponse.model';
import { IUser } from '../models/IUser.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) { }

  sendMessage(msg: string): void {
    this.socket.emit('send-message', {
      message: msg
    } as ISendMessagePayload);
  }

  receiveMessage(): Observable<IReceiveMessagePayload> {
    return this.socket.fromEvent('receive-message');
  }

  userConnection(): Observable<IUser> {
    return this.socket.fromEvent('user-connection');
  }

  userDisconnect(): Observable<IUser> {
    return this.socket.fromEvent('user-disconnect');
  }

  joinChannel(username: string): void {
    this.socket.emit('join-channel', { username: username} as IUser)
  }

  exception(): Observable<IStdResponse> {
    return this.socket.fromEvent('exception');
  }
}
