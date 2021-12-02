import { CreateChannelDialogComponent } from './../components/create-channel-dialog/create-channel-dialog.component';
import { ChatMenuComponent } from './../components/chat-menu/chat-menu.component';
import { MatDialog } from '@angular/material';
import { IChannelResponse, ISidebarChannel, ChannelType } from './../model/IChannel.model';
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
  searchTerm: string = "";
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
      this.chatSocketService.onTeamChannelJoin(),
      this.chatSocketService.onTeamChannelLeave(),
      this.chatSocketService.onCollaborationChannelJoin(),
      this.chatSocketService.onCollaborationChannelLeave(),
    ).subscribe((c) => {
      this.fetchChannels();
    })

    this.messageReceived = this.chatSocketService.receiveMessage().subscribe((d) => {
      this.chatSidebarService.addNotification(d.channelId);
    })

    this.fetchChannels();
  }

  stopPropagation(event: any) {
    event.stopPropagation();
    event.preventDefault();
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
    this.selectPublicChat();
    this.toggleChatMenu();
    this.dialog.open(ChatMenuComponent, { width: '800px', height: '800px' }).afterClosed().subscribe((c) => {
      if (c === 'CREATE') {
        this.openCreateChannelDialog();
      }
    })
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.filterChannels();
  }

  openCreateChannelDialog(): void {
    this.dialog.open(CreateChannelDialogComponent, { width: '400px', height: '400px' }).afterClosed().subscribe((c) => {
      console.log(c);
    })
  }

  fetchChannels(): void {
    const fetchSubscription = this.chatSidebarService.fetchUserChannels(this.auth.activeUser!.uid).subscribe((c: IChannelResponse[]) => {
      this.chatSidebarService.allChannels = c.map((c) => {
        const colors = this.genBubbleColors();
        return { ...c, notificationCount: 0, bgColor: colors.bgColor, textColor: colors.textColor }
      });
      this.filterChannels();
      fetchSubscription.unsubscribe();
    })
  }

  filterChannels(): void {
    this.chatSidebarService.filteredPublicChannels = this.chatSidebarService.allChannels.filter((c) => c.name.includes(this.searchTerm) && c.channel_type === ChannelType.Public);
    this.chatSidebarService.filteredTeamChannels = this.chatSidebarService.allChannels.filter((c) => c.name.includes(this.searchTerm) && c.channel_type === ChannelType.Team);
    this.chatSidebarService.filteredCollaborationChannels = this.chatSidebarService.allChannels.filter((c) => c.name.includes(this.searchTerm) && c.channel_type === ChannelType.Collaboration);
  }

  get isOpen(): boolean {
    return this.chatSidebarService.navOpen;
  }

  selectPublicChat(): void {
    this.onClick(0);
  }

  get channels(): any[] {
    return this.chatSidebarService.allChannels;
  }

  get filteredPublicChannels(): any[] {
    return this.chatSidebarService.filteredPublicChannels;
  }

  get filteredTeamChannels(): any[] {
    return this.chatSidebarService.filteredTeamChannels;
  }

  get filteredCollaborationChannels(): any[] {
    return this.chatSidebarService._filteredCollaborationChannels;
  }

  genBubbleColors(): { bgColor: string, textColor: string } {
    const bgColor = this.getDarkColor();
    const textColor = (Number(`0x1${bgColor}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase();
    return {
      bgColor,
      textColor
    }
  }

  getDarkColor() {
    let color = '';
    for (let i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 10);
    }
    return color;
  }

}
