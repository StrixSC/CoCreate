import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable, Subscription } from "rxjs";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChatSocketService } from "./chat.service";

@Injectable({
  providedIn: "root",
})
export class ChannelManagerService {
  private myChannels: Set<string>;
  private user: firebase.User;
  private afSubscription: Subscription;
  constructor(
    private http: HttpClient,
    private chatSocketService: ChatSocketService,
    private af: AngularFireAuth
  ) {
    this.myChannels = new Set();
  }

  CreateChannel(channel_name: string) {
    this.chatSocketService.createChannel(channel_name);
  }

  GetUser() {
    return this.af.authState;

    // .subscribe((user) => {
    //   if (user) {
    //     this.user = user;
    //     return this.http.get(
    //       "https://colorimage-109-3900.herokuapp.com/api/users/" +
    //         user["uid"] +
    //         "/channels"
    //     );
    //   } else {
    //     return [];
    //   }
    // })
  }

  GetUserChannels(user: string) {
    return this.http.get(
      "https://colorimage-109-3900.herokuapp.com/api/users/" +
        user +
        "/channels"
    );
  }

  JoinChannel(channelId: string) {
    if (this.myChannels.has(channelId)) return;
    this.myChannels.add(channelId);
  }

  removeChannel(channelId: string) {
    this.myChannels.delete(channelId);
  }

  DeleteChannel(channel_id: string) {
    this.chatSocketService.deleteChannel(channel_id);
  }

  GetAllChannels(): Observable<any> {
    return this.http.get(
      "https://colorimage-109-3900.herokuapp.com/api/channels/"
    );
  }

  GetChannelById(channel_id: string): Observable<any> {
    return this.http.get(
      "https://colorimage-109-3900.herokuapp.com/api/channels/" + channel_id
    );
  }
}
