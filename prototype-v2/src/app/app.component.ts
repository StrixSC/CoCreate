import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, of, Subscription } from 'rxjs';
import { ChatService } from './services/chat-service.service';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'prototype-v2';
  messageListener: any;
  currentValue: string;
  messages: string[];

  constructor(public chatService: ChatService) {
    const username = prompt("What is your username?") as string;
    this.chatService.joinChannel(username);
    this.messages = [];
    this.currentValue = "";
  }

  ngOnInit(): void {
    this.chatService.userConnection()
    .subscribe((username) => {
        this.messages.push(`${username} has connected.`);
      });

    this.chatService.userDisconnect()
    .subscribe((username) => {
      this.messages.push(`${username} has disconnected.`);
    })

    this.chatService.receiveMessage()
    .subscribe((response) => {
      console.log(response);
      this.messages.push(`${response.username} said: ${ response.message } @ ${ response.timestamp}`);
    })

    this.currentValue = "";
  
  }

  ngOnDestroy(): void {
    this.messageListener?.unsubscribe();
  }

  sendMessage(): void {
    this.chatService.sendMessage(this.currentValue!);
    this.currentValue = "";
  }
}
