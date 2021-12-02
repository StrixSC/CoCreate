import { CreateChannelDialogComponent } from './../components/create-channel-dialog/create-channel-dialog.component';
import { ChatMenuComponent } from './../components/chat-menu/chat-menu.component';
import { MatDialog } from '@angular/material';
import { IChannelResponse, ISidebarChannel, ChannelType, IMessageResponse } from './../model/IChannel.model';
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

  initSet: boolean = false;
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
      this.addOrUpdateChannels();
    })

    this.messageReceived = this.chatSocketService.receiveMessage().subscribe((d: IMessageResponse) => {
      this.chatSidebarService.handleIncomingMessage(d);
    })

    this.addOrUpdateChannels();
  }

  stopPropagation(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  toggleChatMenu(): void {
    this.chatSidebarService.navOpen = !this.chatSidebarService.navOpen;
  }

  onClick(channel: ISidebarChannel) {
    if (this.chatSidebarService.navOpen && this.chatSidebarService.activeChannel.channel_id === channel.channel_id) {
      this.toggleChatMenu();
    } else {
      this.chatSidebarService.activeChannel = channel;
    }
    channel.notificationCount = 0;
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

  addOrUpdateChannels(): void {
    const snapshot = new Map<string, ISidebarChannel>();
    this.chatSidebarService.allChannels.forEach((c) => snapshot.set(c.channel_id, c));

    const fetchSubscription = this.chatSidebarService.fetchUserChannels(this.auth.activeUser!.uid).subscribe((c: IChannelResponse[]) => {
      const newSnapshot = new Map<string, ISidebarChannel>();
      for (let channel of c) {
        const prevData = snapshot.get(channel.channel_id);
        if (prevData) {
          const newData = {
            ...channel,
            notificationCount: prevData.notificationCount,
            bgColor: prevData.bgColor,
            textColor: prevData.textColor
          } as ISidebarChannel;

          newSnapshot.set(newData.channel_id, newData);
        } else {
          const bubbleColors = this.genBubbleColors();
          newSnapshot.set(channel.channel_id,
            {
              ...channel,
              notificationCount: 0,
              bgColor: bubbleColors.bgColor,
              textColor: bubbleColors.textColor,
              messages: [],
            });
        }
      }

      const updatedChannels = Array.from(newSnapshot).map((d) => d[1]);
      this.chatSidebarService.allChannels = updatedChannels;
      if (!this.initSet) {
        this.selectPublicChat();
        this.initSet = true;
        this.toggleChatMenu();
      }

      this.filterChannels();
      fetchSubscription.unsubscribe();
    })
  }

  filterChannels(): void {
    this.chatSidebarService.filteredChannels = this.chatSidebarService.allChannels.filter((c) => c.name.includes(this.searchTerm));
  }

  get isOpen(): boolean {
    return this.chatSidebarService.navOpen;
  }

  selectPublicChat(): void {
    const publicChannel = this.allChannels.find((c) => c.channel_id === 'PUBLIC');
    if (publicChannel) {
      this.onClick(publicChannel);
    }
  }

  get allChannels() {
    return this.chatSidebarService.allChannels;
  }

  get filteredPublicChannels(): any[] {
    return this.chatSidebarService.filteredChannels.filter((t) => t.channel_type === ChannelType.Public);
  }

  get filteredTeamChannels(): any[] {
    return this.chatSidebarService.filteredChannels.filter((t) => t.channel_type === ChannelType.Team);

  }

  get filteredCollaborationChannels(): any[] {
    return this.chatSidebarService.filteredChannels.filter((t) => t.channel_type === ChannelType.Collaboration);
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
