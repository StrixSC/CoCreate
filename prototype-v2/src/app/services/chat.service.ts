import { IChannel } from '../models/IChannel.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReceiveMessagePayload } from '../models/IReceiveMessagePayload.model';
import { ISendMessagePayload } from '../models/ISendMessagePayload.model';
import { IUser } from '../models/IUser.model';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: SocketService) { }

  sendMessage(msg: string): void {
    this.socket.emit('send-message', {
      message: msg
    } as ISendMessagePayload);
  }

  receiveMessage(): Observable<IReceiveMessagePayload> {
    return this.socket.on('receive-message');
  }

  userConnection(): Observable<IReceiveMessagePayload> {
    return this.socket.on('user-connection');
  }

  userDisconnect(): Observable<IReceiveMessagePayload> {
    return this.socket.on('user-disconnect');
  }

  joinChannel(): void {
    this.socket.emit('join-channel', null);
  }

  getUsers(): Observable<IUser[]> {
    return this.socket.on('get-users');
  }

  getChannels(): Observable<IChannel[]> {
    return this.socket.on('get-channels');
  }

}
