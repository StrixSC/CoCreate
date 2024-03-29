import { TeamService } from 'src/app/services/team.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/chat/socket.service';
import { CreateChannelDialogComponent } from './../components/create-channel-dialog/create-channel-dialog.component';
import { ChatMenuComponent } from './../components/chat-menu/chat-menu.component';
import { MatDialog } from '@angular/material';
import { IChannelResponse, ISidebarChannel, ChannelType, IMessageResponse, IConnectionEventData, ConnectionEventType, IDisconnectionEventData, IOnlineChannelMember } from './../model/IChannel.model';
import { Subscription, merge } from 'rxjs';
import { AuthService } from './../services/auth.service';
import { ChatSidebarService } from './../services/chat-sidebar.service';
import { ChatService } from 'src/app/services/chat/chat.service';
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
  connectionSubscription: Subscription;
  constructor(
    private dialog: MatDialog,
    private chatSidebarService: ChatSidebarService,
    private auth: AuthService,
    private chatSocketService: ChatService,
    private socketService: SocketService,
  ) { }

  ngOnInit() {
    this.channelsSubscription = merge(
      this.chatSocketService.listenCreatedChannels(),
      this.chatSocketService.leftChannel(),
      this.chatSocketService.onChannelUpdated(),
      this.chatSocketService.onChannelDelete(),
      this.chatSocketService.joinedChannel(),
      this.socketService.onStatusChange(),
      this.socketService.onDisconnected(),
      this.socketService.onConnected(),
    ).subscribe((d) => {
      this.addOrUpdateChannels();
    });

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
      this.chatSidebarService.navOpen = true;
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
    this.dialog.open(CreateChannelDialogComponent, { width: '400px', height: '400px' });
  }

  addOrUpdateChannels(): void {
    const snapshot = new Map<string, ISidebarChannel>();
    this.chatSidebarService.allChannels.forEach((c) => snapshot.set(c.channel_id, c));

    const fetchSubscription = this.chatSidebarService.fetchUserChannels(this.auth.activeUser!.uid).subscribe((c: IChannelResponse[]) => {
      const newSnapshot = new Map<string, ISidebarChannel>();
      for (let channel of c) {
        const onlineMembers = this.removeDupes(channel.online_members);
        const prevData = snapshot.get(channel.channel_id);
        if (prevData) {
          const newData = {
            ...channel,
            notificationCount: prevData.notificationCount,
            bgColor: prevData.bgColor,
            textColor: prevData.textColor,
            messages: prevData.messages,
            muteNotification: prevData.muteNotification,
            onlineMembers: onlineMembers
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
              muteNotification: false,
              onlineMembers: onlineMembers,
              messages: [],
            });
        }
      }

      const updatedChannels = Array.from(newSnapshot).map((d) => d[1]);
      this.chatSidebarService.allChannels = updatedChannels;

      if (this.chatSidebarService.activeChannel && this.initSet) {
        const activeChannelId = this.chatSidebarService.activeChannel.channel_id;
        const channel = newSnapshot.get(activeChannelId);
        if (!channel) {
          this.selectPublicChat();
        } else {
          this.chatSidebarService.activeChannel = channel;
        }
      }

      if (!this.initSet) {
        this.selectPublicChat();
        this.initSet = true;
        this.chatSidebarService.navOpen = false;
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
    const bgColor = this.getPastelColor();
    const textColor = (Number(`0x1${bgColor}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase();
    return {
      bgColor,
      textColor
    }
  }

  getPastelColor() {
    return "hsl(" + 360 * Math.random() + ',' +
      (25 + 70 * Math.random()) + '%,' +
      (50 + 10 * Math.random()) + '%)'
  }

  getDarkColor() {
    let color = '';
    for (let i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 10);
    }
    return color;
  }

  removeDupes(arr: IOnlineChannelMember[]): IOnlineChannelMember[] {
    return arr.filter((v, i, a) => a.findIndex(t => (t.userId === v.userId)) === i)
  }

}
