import { AuthService } from 'src/app/services/auth.service';
import { IMessageResponse, IConnectionEventData, ConnectionEventType, IDisconnectionEventData } from './../model/IChannel.model';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IChannelResponse, ISidebarChannel } from '../model/IChannel.model';

@Injectable({
  providedIn: 'root'
})
export class ChatSidebarService {

  isLoading = true;
  _filteredChannels: ISidebarChannel[] = [];
  _allChannels: ISidebarChannel[] = [];
  _activeChannelIndex: number = 0;
  _activeChannel: ISidebarChannel;
  messagesMap: Map<string, IMessageResponse[]> = new Map();
  navOpen: boolean = false;
  notificationAudio: HTMLAudioElement;
  constructor(private auth: AuthService, private http: HttpClient) {
    this.notificationAudio = new Audio();
    this.notificationAudio.src = "/assets/notification.mp3";
    this.notificationAudio.load();
  }

  preventUnavailableActiveChat(): void {
    const channel = this.allChannels.find((c) => this.activeChannel.channel_id === c.channel_id);
    if (!channel) {
      const publicChannel = this.allChannels.find((c) => c.channel_id === 'PUBLIC');
      if (publicChannel) {
        this.activeChannel = publicChannel;
      }
    }
  }

  get allChannels(): ISidebarChannel[] {
    return this._allChannels;
  }

  set allChannels(channels: ISidebarChannel[]) {
    this._allChannels = channels;
    this.isLoading = false;
  }

  get filteredChannels(): ISidebarChannel[] {
    return this._filteredChannels;
  }

  set filteredChannels(channels: ISidebarChannel[]) {
    this._filteredChannels = channels;
  }

  get activeChannel(): ISidebarChannel {
    return this._activeChannel;
  }

  set activeChannel(channel: ISidebarChannel) {
    this._activeChannel = channel;
  }

  handleIncomingMessage(data: IMessageResponse) {
    const channel = this.allChannels.find((c) => c.channel_id === data.channelId);
    if (channel) {
      channel.messages.push(data);
      const notActiveUser = data.username !== this.auth.activeUser!.displayName
      const notActiveChannel = channel.channel_id !== this.activeChannel.channel_id;
      const chatboxNotOpen = !this.navOpen;
      if (notActiveUser && (notActiveChannel || chatboxNotOpen)) {
        channel.notificationCount++;
        if (!channel.muteNotification) {
          this.notificationAudio.play();
        }
      }
    }
  }

  handleConnectionEvent(type: ConnectionEventType, connection: IConnectionEventData & IDisconnectionEventData) {
    const channel = this.allChannels.find((channel) => channel.channel_id === connection.roomId);
    if (channel) {
      if (type === ConnectionEventType.Connection) {
        channel.onlineMembers.push({
          userId: connection.userId,
          username: connection.username,
          status: connection.status,
          avatarUrl: connection.avatarUrl,
        });
      } else if (type === ConnectionEventType.Disconnection) {
        const index = channel.onlineMembers.findIndex((om) => om.userId === connection.userId);
        if (index > -1) {
          channel.onlineMembers.splice(index, 1);
        }
      }
    }
  }

  fetchAllChannels(): Observable<any> {
    return this.http.get(environment.serverURL + "/api/channels/");
  }

  fetchUserChannels(uid: string) {
    return this.http.get(`${environment.serverURL}/api/users/${uid}/channels`);
  }

  addOrUpdateChannelList(channels: ISidebarChannel[]) {
  }
}
