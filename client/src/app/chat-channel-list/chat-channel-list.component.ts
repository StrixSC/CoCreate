import { CreateChannelDialogComponent } from './../components/create-channel-dialog/create-channel-dialog.component';
import { ChatMenuComponent } from './../components/chat-menu/chat-menu.component';
import { MatDialog } from '@angular/material';
import { IChannelResponse } from './../model/IChannel.model';
import { Subscription, merge } from 'rxjs';
import { AuthService } from './../services/auth.service';
import { ChatSidebarService } from './../services/chat-sidebar.service';
import { ChatSocketService } from 'src/app/services/chat/chat.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-channel-list',
  templateUrl: './chat-channel-list.component.html',
  styleUrls: ['./chat-channel-list.component.scss']
})
export class ChatChannelListComponent implements OnInit {

  channelsSubscription: Subscription;
  messageReceived: Subscription;

  constructor(
    private dialog: MatDialog,
    private chatSidebarService: ChatSidebarService,
    private auth: AuthService,
    private chatSocketService: ChatSocketService
  ) { }

  ngOnInit() {
    this.channelsSubscription = merge(
      this.chatSocketService.listenCreatedChannels(),
      this.chatSocketService.leftChannel(),
      this.chatSocketService.onChannelUpdated(),
      this.chatSocketService.onChannelDelete(),
      this.chatSocketService.joinedChannel(),
    ).subscribe((c) => {
      this.fetchChannels();
    })

    this.messageReceived = this.chatSocketService.receiveMessage().subscribe((d) => {
      this.chatSidebarService.addNotification(d.channelId);
    })

    this.fetchChannels();
  }

  toggleChatMenu(): void {
    this.chatSidebarService.navOpen = !this.chatSidebarService.navOpen;
  }

  onClick(index: number) {
    if (this.chatSidebarService.navOpen && this.chatSidebarService.activeChannelIndex === index) {
      this.toggleChatMenu();
    } else {
      this.chatSidebarService.activeChannelIndex = index;
    }
  }

  openChatDialog(): void {
    this.dialog.open(ChatMenuComponent, { width: '800px', height: '800px' }).afterClosed().subscribe((c) => {
      console.log(c);
    })
  }

  openCreateChannelDialog(): void {
    this.dialog.open(CreateChannelDialogComponent, { width: '400px', height: '400px' }).afterClosed().subscribe((c) => {
      console.log(c);
    })
  }

  fetchChannels(): void {
    const fetchSubscription = this.chatSidebarService.fetchUserChannels(this.auth.activeUser!.uid).subscribe((c: IChannelResponse[]) => {
      this.chatSidebarService.allChannels = c.map((c) => ({ ...c, notificationCount: 0 }));
      fetchSubscription.unsubscribe();
    })
  }

  get isOpen(): boolean {
    return this.chatSidebarService.navOpen;
  }

  get channels(): any[] {
    return this.chatSidebarService.allChannels;
  }
}
