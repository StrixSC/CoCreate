import { Component, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";

export interface Messages {
  text: string;
  color: ThemePalette;
  isMe: boolean;
  style: {
    height: string;
    width: string;
    margin?: string;
    right?: string;
  };
}

@Component({
  selector: "app-chat-poped-out",
  templateUrl: "./chat-poped-out.component.html",
  styleUrls: ["./chat-poped-out.component.scss"],
})
export class ChatPopedOutComponent implements OnInit {
  socketConversation: Messages[] = [
    {
      text: "In some scenarios, developers might prefer that behavior over the default and would like to have the same for",
      color: "accent",
      isMe: false,
      style: {
        height: "50px",
        width: "300px",
        margin: "0 5 5 0",
      },
    },

    {
      text: "In some scenarios",
      color: "warn",
      isMe: true,
      style: {
        height: "50px",
        width: "100px",
        right: "1",
      },
    },
  ];

  chatBoxCSS: any = {};
  currentText: string;
  isChatOpen = true;

  constructor() {
    this.openChatBox();
  }
  ngOnDestroy(): void {
    console.log("Destroyed!");
  }

  sendMessage() {
    if (this.currentText.length > 0) {
      this.socketConversation.push({
        text: this.currentText,
        color: "warn",
        isMe: true,
        style: {
          height: "50px",
          width: "100px",
          right: "1",
        },
      });
      this.currentText = "";
      window.scroll(0, 0);
    }
  }

  ngOnInit() {}

  openChatBox() {
    this.chatBoxCSS = {
      width: "400px",
      height: "450px",
      "background-color": "rgb(247, 247, 247)",
      position: "fixed",
      bottom: "0",
      right: "300px",
      border: "2px solid black",
      "border-top-left-radius": "5%",
      "border-top-right-radius": "5%",
      "border-bottom-left-radius": "5%",
      overflow: "hidden",
    };
    this.isChatOpen = true;
  }

  minimiseChatBox() {
    this.chatBoxCSS = {
      width: "350px",
      height: "40px",
      "background-color": "rgb(247, 247, 247)",
      position: "fixed",
      bottom: "0",
      right: "300px",
      border: "2px solid black",
    };
    this.isChatOpen = false;
  }

  popOutChat() {
    window.open(
      "http://localhost:4200/popped-chat",
      "C-Sharpcorner",
      "toolbar=no,scrollbars=no,resizable=yes,top=100,left=500,width=800,height=1000"
    );
  }
}
