import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, Subscription, merge } from "rxjs";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChatService } from "src/app/services/chat/chat.service";
import { SocketService } from "src/app/services/chat/socket.service";

export interface TextChannel {
  name: string;
  style?: Object;
  divStyle?: Object;
}

@Component({
  selector: "app-right-sidebar",
  templateUrl: "./right-sidebar.component.html",
  styleUrls: ["./right-sidebar.component.scss"],
})
export class RightSidebarComponent implements OnInit {
  private textChannels: Map<String, TextChannel>;
  private prevJoinedCollabChannels: Array<String> = [
    "Équipe 109",
    "Équipe 109",
    "Équipe 109",
    "Équipe 109",
  ];
  animal: string;
  name: string;
  selectedChannel: string;
  messageListener: Subscription;
  errorListener: Subscription;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService
  ) {
    this.hardcode();
    this.errorListener = new Subscription();
    this.messageListener = new Subscription();
  }

  ngOnInit(): void {
    this.messageListener = merge(
      this.chatService.userConnection(),
      this.chatService.userDisconnect(),
      this.chatService.receiveMessage()
    ).subscribe((data: IReceiveMessagePayload) => {
      console.log(data);
    });
    this.connectWithUsername();
  }

  connectWithUsername() {
    const username = "demo";

    this.socketService.username = username;
    this.socketService.socket.auth = {
      username,
    };
    this.chatService.joinChannel();
  }

  hardcode() {
    this.textChannels = new Map();
    this.selectedChannel = "general";
    this.textChannels.set("general", {
      name: "general",
    });

    this.textChannels.set("Second", {
      name: "new-channel",
    });

    this.textChannels.set("another", {
      name: "old-channel",
    });

    this.textChannels.set("s", {
      name: "a-channel",
    });
  }

  changeChannel(key: string) {}
}
