import { Component, OnInit } from "@angular/core";
import { IChannel } from "src/app/model/IChannel.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";
import { IpcService } from "src/app/services/notification-manager/IPCManager.service";

@Component({
  selector: "app-right-sidebar",
  templateUrl: "./right-sidebar.component.html",
  styleUrls: ["./right-sidebar.component.scss"],
})
export class RightSidebarComponent implements OnInit {
  private textChannels: Map<String, IChannel>;
  private prevJoinedCollabChannels: Array<String> = [
    "Équipe 109",
    "Équipe 109",
    "Équipe 109",
    "Équipe 109",
  ];

  selectedChannel: string;
  channelBarCss: string;
  channel: IChannel;

  newChannelStyle: Object;
  rightsidebarCss: any;
  chatDivView: Object;

  audio: HTMLAudioElement | null;

  constructor(
    private channelManager: ChannelManagerService,
    private ipcService: IpcService
  ) {
    this.textChannels = new Map();
    this.newChannelStyle = { display: "none" };
    this.chatDivView = { display: "none", transition: "0.2s" };
    // this.audio = new Audio();
    // this.audio.src = "../../../../assets/Audio/Track 1.mp3";
    // this.audio.load();
    // this.audio.play();
    this.ipcService.send("#general", "hello from angular!");
  }

  ngOnInit(): void {
    this.channelManager.GetUser().subscribe((user) => {
      if (user) {
        this.channelManager
          .GetUserChannels(user["uid"])
          .subscribe((channel_list: any[]) => {
            console.log(channel_list);
            this.connectChannels(channel_list);
          });
      }
    });
  }

  connectChannels(channel_list: any[]) {
    channel_list.forEach((channel: IChannel) => {
      channel.channel_id;
      this.textChannels.set(channel.channel_id, channel);
    });
  }

  getChannels() {
    this.channelManager.GetAllChannels().subscribe((data: any) => {
      data.forEach((element: IChannel) => {
        this.textChannels.set(element.channel_id, element);
      });
    });
  }

  AddChannel(channel_id: IChannel) {
    console.log("AddChannel", channel_id);
    this.textChannels.set(channel_id.channel_id, channel_id);
  }

  DeleteChannel(channel_id: IChannel) {
    this.textChannels.delete(channel_id.channel_id);
  }

  changeChannel(channelID: string) {
    this.selectedChannel = channelID;
    this.newChannelStyle = { display: "none" };

    if (this.textChannels.has(channelID)) {
      this.channel = this.textChannels.get(channelID) as IChannel;
      this.chatDivView = { display: "block", transition: "0.2s" };
      this.rightsidebarCss = { width: "550px" };
    } else {
      this.chatDivView = { display: "none", transition: "0.2s" };
    }
  }

  newChannel() {
    this.chatDivView = { display: "none", transition: "0.2s" };
    this.newChannelStyle = {};
    const width_ = window.innerWidth * 0.8;
    this.rightsidebarCss = {
      width: width_.toString() + "px",
    };
    this.channelBarCss = (width_ - 180).toString() + "px";
  }

  closeBar() {
    this.rightsidebarCss = { width: "150px" };
    this.chatDivView = { display: "none", transition: "0.2s" };
    this.newChannelStyle = { display: "none" };
  }
}
