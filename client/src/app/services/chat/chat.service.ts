import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IChannel } from '../../model/IChannel.model';
import { IReceiveMessagePayload } from '../../model/IReceiveMessagePayload.model';
import { ISendMessagePayload } from '../../model/ISendMessagePayload.model';
import { IUser } from '../../model/IUser.model';
import { SocketService } from './socket.service';
// import { BrowserWindow } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  constructor(private socket: SocketService) { }

  sendMessage(msg: string): void {
    this.socket.emit('send-message', {
      message: msg,
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
  openChatWindow() {
    const winRef: Window | null = window.open('chat', '_blank', 'toolbar=no,scrollbars=yes,resizable=0,menubar=1, max-width=400,max-height=400');

    if (winRef !== null && winRef.location.href === 'about:blank') {

      winRef.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = '';
    });
      winRef.location.href = 'chat';
      console.log('hey');
    }
  }

}
