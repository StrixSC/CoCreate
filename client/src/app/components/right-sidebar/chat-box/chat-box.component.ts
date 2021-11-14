import { Component, OnInit } from "@angular/core";
import { ChatService } from "src/app/services/chat/chat.service";
import { Observable, Subscription } from "rxjs";

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
export class ChatBoxComponent implements OnInit {
  chatCss: any = { width: "300px" };
  chatBoxName: string;
  currentText: string;
  tiles: MessageHeader[] = [
    { text: "Avatar", cols: 1, rows: 1, color: "lightpink" },
    { text: "Pritam", cols: 2, rows: 1, color: "#DDBDF1" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
  ];

  messages: Array<Message>;
  constructor(private chatService: ChatService) {
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
    this.chatBoxName = "General";
  }
  ngOnInit(): void {}

  updateChat() {}

  sendMessage() {
    if (this.currentText.length > 0) {
      console.log(this.currentText);
      this.messages.push({
        message: this.currentText,
        avatar: "avatar",
        username: "@me",
        time: "8:30pm",
      });
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
