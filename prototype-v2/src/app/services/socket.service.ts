import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket: any;
  constructor() {
  }

  setupSocketConnection() {
    this.socket = io(environment.WS_URL);
  }

  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
    }
  }
}
