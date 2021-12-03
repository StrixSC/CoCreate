import { AuthService } from 'src/app/services/auth.service';
import { IMessageResponse } from './../model/IChannel.model';
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
    this.notificationAudio.src = "/assets/notification.wav";
    this.notificationAudio.load();
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
    this.navOpen = true;
    this._activeChannel = channel;
  }

  handleIncomingMessage(data: IMessageResponse) {
    const channel = this.allChannels.find((c) => c.channel_id === data.channelId);
    if (channel) {

      channel.messages.push(data);
      if (data.username !== this.auth.activeUser!.displayName && this.activeChannel.channel_id !== channel.channel_id || !this.navOpen) {
        channel.notificationCount++;
        if (!channel.muteNotification) {
          this.notificationAudio.play();
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
