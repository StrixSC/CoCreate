import { environment } from 'src/environments/environment';
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChatSocketService } from "./chat.service";

@Injectable({
  providedIn: "root",
})
export class ChannelManagerService {
  private myChannels: Set<string>;
  constructor(
    private http: HttpClient,
    private chatSocketService: ChatSocketService
  ) {
    this.myChannels = new Set();
  }

  JoinChannel(channelId: string) {
    if (this.myChannels.has(channelId)) return;
    this.myChannels.add(channelId);
  }

  removeChannel(channelId: string) {
    this.myChannels.delete(channelId);
  }

  GetAllChannels(): Observable<any> {
    return this.http.get(
      environment.serverURL + "/api/channels/"
    );
  }

  GetChannelById(channel_id: string): Observable<any> {
    return this.http.get(
      environment.serverURL + "/api/channels/" + channel_id
    );
  }
}
