import { AuthService } from './auth.service';
import { ICollaborationJoinPayload, ICollaborationConnectPayload, ICollaborationCreatePayload, ICollaborationUpdatePayload, ICollaborationDeletePayload, ICollaborationDisconnectPayload, ICollaborationLeavePayload } from './../model/ICollaboration.model';
import { ICreateCollaboration } from "../model/IGalleryEntry.model";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { SocketService } from "./chat/socket.service";

@Injectable({
  providedIn: "root",
})
export class SyncCollaborationService {
  constructor(
    private authService: AuthService,
    private socketService: SocketService
  ) { }

  sendJoinCollaboration(data: ICollaborationJoinPayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:join', { ...data, userId: this.authService.activeUser.uid });
  }

  sendDisconnect(data: ICollaborationDisconnectPayload) {
    this.socketService.emit('collaboration:disconnect', { ...data });
  }

  sendConnectCollaboration(data: ICollaborationConnectPayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:connect', { ...data, userId: this.authService.activeUser.uid });
  }

  sendCreateCollaboration(data: ICollaborationCreatePayload): void {
    if (!this.authService.activeUser) {
      return;
    }
    this.socketService.emit('collaboration:create', data);
  }

  sendUpdateCollaboration(data: ICollaborationUpdatePayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:update', data);
  }

  sendDeleteCollaboration(data: ICollaborationDeletePayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:delete', { ...data, userId: this.authService.activeUser.uid });
  }

  sendLeaveCollaboration(data: ICollaborationLeavePayload) {
    if (!this.authService.activeUser) {
      return;
    }
    console.log(data)
    this.socketService.emit('collaboration:leave', { ...data, userId: this.authService.activeUser.uid });
  }

  onCollaborationException(): Observable<any> {
    return this.socketService.on('collaboration:exception');
  }

  onDeleteException(): Observable<any> {
    return this.socketService.on('collaboration:delete:exception');
  }

  onDeleteFinished(): Observable<any> {
    return this.socketService.on('collaboration:delete:finished');
  }

  onCreateCollaboration(): Observable<ICreateCollaboration> {
    return this.socketService.on("collaboration:created");
  }

  onJoinCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:joined");
  }

  onLeaveCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:left");
  }

  onDeleteCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:deleted");
  }

  onConnectCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:connected");
  }

  onDisconnectCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:disconnected");
  }

  onLoadCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:load");
  }

  onUpdateCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:updated");
  }

}
