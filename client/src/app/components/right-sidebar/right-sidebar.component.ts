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
  my_channels_load: Set<string>; // Current user channels on load.
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
    this.my_channels_load = new Set();
    this.newChannelStyle = { display: "none" };
    this.chatDivView = { display: "none", transition: "0.2s" };
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
    const channels = new Array<string>();

    channel_list.forEach((channel: IChannel) => {
      channels.push(channel.channel_id);
      this.textChannels.set(channel.channel_id, channel);
      this.my_channels_load.add(channel.channel_id);
    });

    localStorage.setItem("on_load_channels", JSON.stringify(channels));
    // this.my_channels_load = channels;
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
    this.RemoveSelectionCSS();
    this.selectedChannel = channelID;
    this.newChannelStyle = { display: "none" };
    if (this.textChannels.has(channelID)) {
      this.channel = this.textChannels.get(channelID) as IChannel;
      this.chatDivView = { display: "block", transition: "0.2s" };
      this.rightsidebarCss = { width: "550px" };
      this.AddSelectionCSS();
    } else {
      this.chatDivView = { display: "none", transition: "0.2s" };
    }
  }

  RemoveSelectionCSS() {
    const channel = this.textChannels.get(this.selectedChannel);
    if (channel) {
      channel.style = {};
      this.textChannels.set(this.selectedChannel, channel);
    }
  }

  AddSelectionCSS() {
    const channel = this.textChannels.get(this.selectedChannel);
    if (channel) {
      channel.style = { color: "white" };
      this.textChannels.set(this.selectedChannel, channel);
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
