import { EMPTY } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;
  error: string;
  username: string;
  url: string;
  constructor(private af: AngularFireAuth) {
    this.error = '';
    this.username = '';
    this.url = environment.serverURL;
  }

  async setupSocketConnection(): Promise<void> {
    if (!this.af.auth.currentUser) {
      return;
    }

    const userToken = await this.af.auth.currentUser.getIdToken();

    this.socket = io(this.url, {
      autoConnect: true,
      extraHeaders: {
        Authorization: 'Bearer ' + userToken,
      },
    }) as Socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }

  onAny(): Observable<any> {
    return new Observable((observer) => {
      this.socket.onAny((data: any) => {
        observer.next(data);
      });
    });
  }

  onError(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('connect_error', (err) => {
        observer.next(err);
      });
    });
  }

  onException(): Observable<{ message: string }> {
    return new Observable((observer) => {
      this.socket.on('exception', (err: { message: string }) => {
        observer.next(err);
      });
    });
  }

  onDisconnected(): Observable<any> {
    return this.on('user:disconnected');
  }

  onDisconnectionComplete(): Observable<any> {
    return this.on('disconnection:complete');
  }

  onConnectionComplete(): Observable<any> {
    return this.on('connection:complete');
  }

  onConnected(): Observable<any> {
    return this.on('user:connected');
  }

  onStatusChange(): Observable<any> {
    return this.on('status-change');
  }

  sendInit(): void {
    this.emit('user:init', null);
  }

  onInit(): Observable<void> {
    return this.on('user:initialized');
  }

  onInitException(): Observable<any> {
    return this.on('user:init:exception');
  }
}
