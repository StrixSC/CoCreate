import { AuthService } from './auth.service';
import { ICollaborationJoinPayload, ICollaborationConnectPayload, ICollaborationCreatePayload, ICollaborationUpdatePayload, ICollaborationDeletePayload } from './../model/ICollaboration.model';
import {
  IGalleryEntry, IConnectCollaboration, ICreateCollaboration
} from "../model/IGalleryEntry.model";
import { Observable, of, EMPTY } from "rxjs";
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

  onLoadCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:load");
  }

  onUpdateCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:updated");
  }

  sendJoinCollaboration(data: ICollaborationJoinPayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:join', { ...data, userId: this.authService.activeUser.uid });
  }

  sendConnectCollaboration(data: ICollaborationConnectPayload) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:join', { ...data, userId: this.authService.activeUser.uid });
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

  sendLeaveCollaboration(data: { userId: string, collaborationId: string }) {
    if (!this.authService.activeUser) {
      return;
    }

    this.socketService.emit('collaboration:leave', { ...data, userId: this.authService.activeUser.uid });
  }

  onCollaborationException(): Observable<any> {
    return this.socketService.on('collaboration:exception');
  }

}
