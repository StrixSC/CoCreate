import { IMessageHttpResponse, IMessageResponse } from './../../model/IChannel.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ISendMessagePayload } from "../../model/ISendMessagePayload.model";
import { IUser } from "../../model/IUser.model";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  constructor(private socket: SocketService, private http: HttpClient) { }

  sendMessage(channel_id: string, msg: string): void {
    this.socket.emit("channel:send", {
      channelId: channel_id,
      message: msg,
    } as ISendMessagePayload);
  }

  getChannelHistory(channelId: string): Observable<IMessageHttpResponse[]> {
    return this.http.get<IMessageHttpResponse[]>(`${environment.serverURL}/api/channels/${channelId}/messages`);
  }

  receiveMessage(): Observable<IMessageResponse> {
    return this.socket.on("channel:sent");
  }

  joinedChannel() {
    return this.socket.on("channel:joined");
  }

  leaveChannel(channel_id: string): void {
    return this.socket.emit("channel:leave", {
      channelId: channel_id,
    });
  }

  leftChannel() {
    return this.socket.on("channel:left");
  }

  deleteChannel(channel_id: string) {
    return this.socket.emit("channel:delete", {
      channelId: channel_id,
    });
  }

  onChannelDelete(): any {
    return this.socket.on('channel:deleted');
  }

  onChannelUpdated(): any {
    return this.socket.on('channel:updated');
  }

  onChannelLeft(): any {
    return this.socket.on('channel:left');
  }

  onChannelDeleteException(): any {
    return this.socket.on('channel:delete:exception');
  }

  onChannelLeaveException(): any {
    return this.socket.on('channel:leave:exception');
  }

  onChannelJoinException(): any {
    return this.socket.on('channel:join:exception');
  }

  onChannelUpdateException(): any {
    return this.socket.on('channel:update:exception');
  }

  onChannelDeleteFinish(): any {
    return this.socket.on('channel:delete:finished');
  }

  onChannelUpdateFinish(): any {
    return this.socket.on('channel:update:finished')
  }

  onChannelCreateException(): any {
    return this.socket.on('channel:create:exception');
  }

  onTeamChatJoined(): any {
    return this.socket.on('teams:channel:joined');
  }

  joinChannel(channelId: string): void {
    this.socket.emit("channel:join", {
      channelId: channelId,
    });
  }

  getUsers(): Observable<IUser[]> {
    return this.socket.on("get-users");
  }

  createChannel(channelName: string): void {
    this.socket.emit("channel:create", {
      channelName: channelName,
    });
  }

  listenCreatedChannels(): Observable<any> {
    return this.socket.on("channel:created");
  }

  onTeamChannelJoin(): Observable<any> {
    return this.socket.on('teams:channel:join');
  }

  onTeamChannelLeave(): Observable<any> {
    return this.socket.on('teams:channel:leave');
  }

  onCollaborationChannelJoin(): Observable<any> {
    return this.socket.on('collaboration:channel:join');
  }

  onCollaborationChannelLeave(): Observable<any> {
    return this.socket.on('collaboration:channel:leave');
  }

  openChatWindow() {
    const winRef: Window | null = window.open(
      "chat",
      "_blank",
      "toolbar=no,scrollbars=yes,resizable=0,menubar=1, max-width=400,max-height=400"
    );

    if (winRef !== null && winRef.location.href === "about:blank") {
      winRef.addEventListener("beforeunload", function (e) {
        e.preventDefault();
        e.returnValue = "";
      });
      winRef.location.href = "chat";
      console.log("hey");
    }
  }
}
