import { MatSnackBar } from '@angular/material';
import { SocketService } from 'src/app/services/chat/socket.service';
import { AuthService } from './../../services/auth.service';
import { IMessageResponse } from './../../model/IChannel.model';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat/chat.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

interface IChannelJoinResponse {
  channelId: string;
  channelName: string;
}

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit {

  constructor(private snackbar: MatSnackBar, private activeRoute: ActivatedRoute, private socketService: SocketService, private auth: AuthService, private chatService: ChatService) { }
  messageSubscription: Subscription;
  joinedSubscription: Subscription;
  message: string = "";
  messages = [] as IMessageResponse[];
  isLoading: boolean = true;
  activeChannel: IChannelJoinResponse;
  async ngOnInit() {
    this.auth.authState.subscribe(async (s) => {
      if (s) {
        try {
          this.auth.activeUser = s;
          await this.socketService.setupSocketConnection();
          this.init();
        } catch (e) {
          this.snackbar.open(`Oups... quelque chose d\'imprévu s'est passé lors du chargement de la messagerie...`, 'OK');
        }
      }
    });

  }

  init(): void {
    const channelId: string = this.activeRoute.snapshot.params.id;
    if (channelId) {
      this.chatService.joinChannel(channelId);
      this.joinedSubscription = this.chatService.joinedChannel().subscribe((c: IChannelJoinResponse) => {
        this.activeChannel = c;
        this.isLoading = false;
      });

      this.messageSubscription = this.chatService.receiveMessage().subscribe((c: IMessageResponse) => {
        this.messages.push(c);
      })
    }
  }

  isActiveUser(username: string): boolean {
    return this.auth.activeUser!.displayName === username;
  }

  onSubmit() {
    this.chatService.sendMessage(this.activeChannel.channelId, this.message);
    this.message = "";
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    if (this.joinedSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

}
