import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;
  error: string;
  username: string;
  constructor() {
    this.error = "";
    this.username = "";
  }

  setupSocketConnection(ip?: string): void {
    this.socket = io(environment.WS_URL || "http://localhost:3000", { autoConnect: false }) as Socket;
  }

  connect(): void {
    this.socket.connect();
    this.socket.sendBuffer = [];
    console.log(environment)
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
      })
    }) 
  }

  onError(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('connect_error', (err) => {
        observer.next(err);
      })
    })

  }
}
