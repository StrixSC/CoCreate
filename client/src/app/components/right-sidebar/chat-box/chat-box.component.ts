import { Component, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { NgForm } from "@angular/forms";

export interface Tile {
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
  tiles: Tile[] = [
    { text: "Avatar", cols: 1, rows: 1, color: "lightpink" },
    { text: "Pritam", cols: 2, rows: 1, color: "#DDBDF1" },
    { text: "Three", cols: 1, rows: 1, color: "lightpink" },
  ];
  currentText: string;

  messages: Array<Message>;
  constructor() {
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
    console.log("l");
  }

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
  }
}
