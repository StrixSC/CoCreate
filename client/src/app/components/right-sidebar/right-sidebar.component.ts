import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IChannel } from "src/app/model/IChannel.model";
import { ChatSocketService } from "src/app/services/chat/chat.service";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";

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
  channel: IChannel;
  chatView: boolean;
  chatStyle: Object;
  newChannelStyle: Object;
  exampleCss: any;
  constructor(private channelManager: ChannelManagerService) {
    this.textChannels = new Map();
    this.chatView = true;
    this.newChannelStyle = { display: "none" };
  }

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels() {
    this.channelManager.GetAllChannels().subscribe((data: any) => {
      data.forEach((element: IChannel) => {
        this.textChannels.set(element.channel_id, element);
      });
    });
  }

  changeCSS(channelID: string) {
    const prev = this.textChannels.get(this.selectedChannel) as IChannel;
    if (prev) {
      prev.divStyle = {
        "margin-left": "10px",
        "margin-right": "10px",
        "margin-top": "-12px",
        "background-color": "#393c43",
        height: "30px",
        "border-radius": "7px",
        cursor: "pointer",
        "animation-duration": "4s",
      };
      this.textChannels.set(this.selectedChannel, prev);
    }

    const next = this.textChannels.get(channelID) as IChannel;
    if (next) {
      next.divStyle = {
        padding: "5px",
        color: "white",
        "margin-right": "5px",
        "margin-top": "0px",
      };
      this.textChannels.set(channelID, next);
    }
  }

  changeChannel(channelID: string) {
    this.selectedChannel = channelID;
    // this.changeCSS(channelID);
    if (this.textChannels.has(channelID)) {
      this.channel = this.textChannels.get(channelID) as IChannel;
      this.newChannelStyle = { display: "none" };
      this.exampleCss = { width: "550px" };
    }
  }

  newChannel() {
    this.chatView = false;
    this.chatStyle = { display: "none" };
    this.newChannelStyle = {};
    const expand: string = (window.innerWidth * 0.8).toString() + "px";
    this.exampleCss = { width: expand };
  }
}
