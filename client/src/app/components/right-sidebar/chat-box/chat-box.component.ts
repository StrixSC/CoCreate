import {
  Component,
  OnInit,
  Input,
  OnChanges,
  AfterViewInit,
} from "@angular/core";
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
export class ChatBoxComponent implements OnInit, OnChanges, AfterViewInit {
  chatCss: any = { width: "300px" };
  chatBoxName: string;
  alreadySubbed: boolean;
  messagesList: Set<string>;
  @Input() channel_object: IChannel;

  currentText: string;

  tiles: MessageHeader[] = [
    { text: "Avatar", cols: 1, rows: 1, color: "lightpink" },
    { text: "Pritam", cols: 2, rows: 1, color: "#DDBDF1" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
  ];

  messages: Array<Message>;
  constructor(private chatService: ChatService, private http: HttpClient) {
    this.messagesList = new Set();
    this.messages = [];
    this.alreadySubbed = false;
  }
  ngOnInit(): void {
    this.chatCss = { display: "none" };
  }

  ngAfterViewInit() {}

  getMessagesFromChannel(channelID: string) {
    this.messages = [];
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" +
          channelID +
          "/messages"
      )
      .subscribe((data: any) => {
        data.forEach((m: any) => {
          this.messages.push({
            message: m.message_data,
            avatar: m.avatar_url,
            username: m.username,
            time: m.timestamp,
          });
        });
      });
  }

  ngOnChanges() {
    this.chatCss = { width: "300px" };

    if (this.channel_object) {
      this.getMessagesFromChannel(this.channel_object.channel_id);

      if (!this.alreadySubbed) {
        this.chatService
          .receiveMessage()
          .subscribe((data: IReceiveMessagePayload) => {
            console.log(data);
            if (
              !this.messagesList.has(data.messageId) &&
              data.channelId === this.channel_object.channel_id
            ) {
              this.messages.push({
                message: data.message,
                avatar: data.avatarUrl,
                username: data.username,
                time: data.createdAt,
              });
              this.messagesList.add(data.messageId);
            }
            console.log(this.messagesList);
            if (this.messagesList.size > 20) {
              this.messagesList.clear();
            }
          });
      }
      this.chatBoxName = this.channel_object.name;
      this.chatService.joinChannel(this.channel_object.channel_id);
      console.log("changing channels");
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
