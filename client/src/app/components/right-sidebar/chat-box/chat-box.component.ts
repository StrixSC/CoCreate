import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { ChatService } from "src/app/services/chat/chat.service";
import { HttpClient } from "@angular/common/http";
import { Observable, Subscription } from "rxjs";
import { IChannel } from "src/app/model/IChannel.model";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";

export interface MessageHeader {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

export interface Message {
  message: string;
  avatar: string;
  username: string;
  time: string;
}

@Component({
  selector: "app-chat-box",
  templateUrl: "./chat-box.component.html",
  styleUrls: ["./chat-box.component.scss"],
})
export class ChatBoxComponent implements OnInit, OnChanges {
  chatCss: any = { width: "300px" };
  chatBoxName: string;
  previous_channel: IChannel;
  @Input() channel_object: IChannel;

  currentText: string;

  tiles: MessageHeader[] = [
    { text: "Avatar", cols: 1, rows: 1, color: "lightpink" },
    { text: "Pritam", cols: 2, rows: 1, color: "#DDBDF1" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
  ];

  messages: Array<Message>;
  constructor(private chatService: ChatService, private http: HttpClient) {
    this.messages = [];
    this.previous_channel = {
      channel_id: "PUBLIC",
      collaboration_id: "PUBLIC",
      name: "PUBLIC",
      owner_username: "PUBLIC",
      type: "PUBLIC",
      updated_at: "PUBLIC",
    };
  }
  ngOnInit(): void {
    this.chatCss = { display: "none" };
  }

  getMessagesFromChannel(channelID: string) {
    this.messages = [];
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" +
          channelID +
          "/messages"
      )
      .subscribe((data: IReceiveMessagePayload[]) => {
        data.forEach((message: IReceiveMessagePayload) => {
          // console.log(message);
        });
      });
  }

  ngOnChanges() {
    this.chatCss = { width: "300px" };
    console.log("Leaving channel", this.previous_channel.name);
    this.chatService.leaveChannel(this.previous_channel.channel_id);

    if (this.channel_object) {
      this.getMessagesFromChannel(this.channel_object.channel_id);

      this.chatBoxName = this.channel_object.name;

      this.previous_channel = this.channel_object;
      this.chatService.joinChannel(this.channel_object.channel_id);
      this.chatService
        .receiveMessage()
        .subscribe((data: IReceiveMessagePayload) => {
          this.messages.push({
            message: data.message,
            avatar: data.avatarUrl,
            username: data.username,
            time: data.createdAt,
          });
        });
    }
  }

  sendMessage() {
    if (this.currentText.length > 0) {
      this.chatService.sendMessage(
        this.channel_object.channel_id,
        this.currentText
      );
      this.currentText = "";
    }
  }

  OnInit() {}

  popOutChat() {
    window.open(
      "http://localhost:4200/popped-chat",
      "C-Sharpcorner",
      "toolbar=no,scrollbars=no,resizable=yes,top=100,left=500,width=800,height=1000"
    );
    this.chatCss = { display: "none" };
  }
}
