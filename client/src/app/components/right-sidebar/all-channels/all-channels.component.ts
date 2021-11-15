import { Component, OnInit } from "@angular/core";
import { IChannel } from "src/app/model/IChannel.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";

@Component({
  selector: "app-all-channels",
  templateUrl: "./all-channels.component.html",
  styleUrls: ["./all-channels.component.scss"],
})
export class AllChannelsComponent implements OnInit {
  all_channels: Map<string, IChannel>;
  constructor(private channelManagerService: ChannelManagerService) {
    this.all_channels = new Map();
  }

  ngOnInit() {
    this.getChannels();
  }

  getChannels() {
    this.channelManagerService.GetAllChannels().subscribe((data: any) => {
      data.forEach((element: IChannel) => {
        this.all_channels.set(element.channel_id, element);
      });
    });
  }
}
