import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { ChatService } from "src/app/services/chat/chat.service";
import { HttpClient } from "@angular/common/http";
import { Observable, Subscription } from "rxjs";
import { IChannel } from "src/app/model/IChannel.model";

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
  @Input() channel_object: IChannel;

  currentText: string;

  tiles: MessageHeader[] = [
    { text: "Avatar", cols: 1, rows: 1, color: "lightpink" },
    { text: "Pritam", cols: 2, rows: 1, color: "#DDBDF1" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
  ];

  messages: Array<Message>;
  constructor(private chatService: ChatService, private http: HttpClient) {
    this.messages = [
      {
        message: "Bonjour comment va tu?",
        avatar: "avatar",
        username: "Max",
        time: "8:30pm",
      },
      {
        message: "Bien et toi?",
        avatar: "avatar",
        username: "Bob",
        time: "8:30pm",
      },
    ];
  }
  ngOnInit(): void {
    this.chatCss = { display: "none" };
    this.chatService.receiveMessage().subscribe((data) => {
      console.log(data, "from child");
    });
  }

  ngOnChanges() {
    this.chatCss = { width: "300px" };
    this.chatBoxName = this.channel_object.name;
    this.chatService.joinChannel(this.channel_object.channel_id);
  }

  sendMessage() {
    if (this.currentText.length > 0) {
      // console.log(this.currentText);
      this.messages.push({
        message: this.currentText,
        avatar: "avatar",
        username: "@me",
        time: "8:30pm",
      });
      this.chatService.sendMessage(this.currentText);
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
