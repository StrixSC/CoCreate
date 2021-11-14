import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable, Subscription, merge } from "rxjs";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChatService } from "src/app/services/chat/chat.service";
import { SocketService } from "src/app/services/chat/socket.service";
import { HttpClient } from "@angular/common/http";

export interface TextChannel {
  channel_id: string;
  collaboration_id: any;
  name: string;
  owner_username: string;
  type: string;
  updated_at: string;
  style?: Object;
  divStyle?: Object;
}

// channel_id: "PUBLIC";
// collaboration_id: null;
// name: "Public";
// owner_username: "admin";
// type: "Public";
// updated_at: "2021-11-09T23:33:52.316Z";

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
    private socketService: SocketService,
    private http: HttpClient
  ) {
    this.textChannels = new Map();
    this.errorListener = new Subscription();
    this.messageListener = new Subscription();
  }

  ngOnInit(): void {
    this.textChannels = new Map();

    this.http
      .post("https://colorimage-109-3900.herokuapp.com/api/channels/create/", {
        channelName: "general",
      })
      .subscribe((res) => console.log(res));

    this.getChannels();

    // this.messageListener = merge(
    //   this.chatService.userConnection(),
    //   this.chatService.userDisconnect(),
    //   this.chatService.receiveMessage()
    // ).subscribe((data: IReceiveMessagePayload) => {
    //   console.log(data);
    // });
    // this.connectWithUsername();
  }

  connectWithUsername() {
    const username = "demo";

    this.socketService.username = username;
    this.socketService.socket.auth = {
      username,
    };
    this.chatService.joinChannel();
  }

  getChannels() {
    this.http
      .get("https://colorimage-109-3900.herokuapp.com/api/channels/")
      .subscribe((data: any) => {
        data.forEach((element: TextChannel) => {
          this.textChannels.set(element.channel_id, element);
        });
      });
  }

  changeChannel(channelID: string) {
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" + channelID
      )
      .subscribe((data: any) => {
        console.log(data);
      });
  }
}
