import { IUser } from '../../model/IUser.model';
import { SocketService } from '../../services/chat/socket.service';
import { Component, OnDestroy } from '@angular/core';
import { Subscription/*, merge*/ } from 'rxjs';
//import { map } from 'rxjs/operators';
import { ChatService } from '../../services/chat/chat.service';
//import { IReceiveMessagePayload } from './model/IReceiveMessagePayload.model';
import { IChannel } from '../../model/IChannel.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'prototype-v2';
  messageListener = new Subscription();
  currentValue: string;
  users: IUser[];
  channels: IChannel[];
  messages: string[];
  username: string;

  constructor(public chatService: ChatService, private socketService: SocketService) {
    this.username = "";
    this.socketService.setupSocketConnection();
    this.currentValue = "";
    this.messages = [];
    this.users = [];
    this.channels = [];
  }

  ngOnInit(): void {



    this.chatService.getUsers().subscribe((users) => {
      this.users = users.sort((a) => {
        if (a.userId !== this.socketService.socket.id) return -1
        else return 1;
      });
      
      this.users = users;
      console.log(users);
    });
  
    this.chatService.getChannels().subscribe((channels: IChannel[]) => {
      this.channels = channels;
      console.log(channels);
    })

    
  }

  ngOnDestroy(): void {
    this.messageListener.unsubscribe();
    this.socketService.disconnect();
  }

  sendMessage(): void {
    this.chatService.sendMessage(this.currentValue!);
    this.currentValue = "";
  }
}
