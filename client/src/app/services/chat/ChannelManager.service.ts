import { Injectable } from "@angular/core";
import { ChatService } from "./chat.service";

@Injectable({
  providedIn: "root",
})
export class ChannelManagerService {
  private myChannels: Set<string>;
  constructor(private chatService: ChatService) {
    this.myChannels = new Set();
  }

  JoinChannel(channelId: string) {
    if (this.myChannels.has(channelId)) return;
    this.myChannels.add(channelId);
  }

  removeChannel(channelId: string) {
    this.myChannels.delete(channelId);
  }
}
