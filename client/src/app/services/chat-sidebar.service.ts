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
  _allChannels: ISidebarChannel[] = [];
  _activeChannelIndex: number = 0;
  navOpen: boolean = false;

  constructor(private http: HttpClient) { }

  get allChannels(): ISidebarChannel[] {
    return this._allChannels;
  }

  set allChannels(channels: ISidebarChannel[]) {
    this._allChannels = channels;
    this.isLoading = false;
  }

  get activeChannel(): IChannelResponse {
    return this._allChannels[this._activeChannelIndex];
  }

  get activeChannelIndex(): number {
    return this._activeChannelIndex;
  }

  set activeChannelIndex(channelIndex: number) {
    this.navOpen = true;
    this._activeChannelIndex = channelIndex;
  }

  addNotification(channelId: string) {
    if (this.activeChannel.channel_id === channelId && this.navOpen) {
      return;
    }

    const index = this.allChannels.findIndex((c) => c.channel_id === channelId);
    if (index >= 0) {
      // TODO: Add notification sound
      this.allChannels[index].notificationCount++;
    }
  }

  fetchAllChannels(): Observable<any> {
    return this.http.get(environment.serverURL + "/api/channels/");
  }

  fetchUserChannels(uid: string) {
    return this.http.get(`${environment.serverURL}/api/users/${uid}/channels`);
  }
}
