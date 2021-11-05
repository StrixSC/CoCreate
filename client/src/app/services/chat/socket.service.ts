import { Observable } from "rxjs";
import { Injectable, isDevMode } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  socket!: Socket;
  error: string;
  username: string;
  url: string;
  constructor() {
    this.error = "";
    this.username = "";
    this.url = environment.serverURL
  }

  setupSocketConnection(userId: string): void {
    this.socket = io(this.url, {
      autoConnect: false,
      withCredentials: true,
      extraHeaders: {
        'x-user-id': userId
      }
    }) as Socket;
  }

  connect(): void {
    this.socket.connect();
    console.log(this.socket.connected);
    this.socket.sendBuffer = [];
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
      this.socket.on("connect_error", (err) => {
        observer.next(err);
      });
    });
  }

  onException(): Observable<{ message: string }> {
    return new Observable((observer) => {
      this.socket.on('exception', (err: { message: string }) => {
        observer.next(err);
      });
    })
  }
}
