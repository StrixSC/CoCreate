import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { IChannel } from "src/app/model/IChannel.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";

@Component({
  selector: "app-all-channels",
  templateUrl: "./all-channels.component.html",
  styleUrls: ["./all-channels.component.scss"],
})
export class AllChannelsComponent implements OnInit {
  all_channels: Map<string, IChannel>;
  @Output() closeChannelsEvent = new EventEmitter<boolean>();

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

  joinChannel(key: string) {
    console.log("joined!", key);
    let channel: IChannel | undefined = this.all_channels.get(key);
    if (channel) {
      channel.btnStyle = { "background-color": "red" };
      this.all_channels.set(key, channel);
    }
  }

  closeChannelBar() {
    this.closeChannelsEvent.emit(false);
  }
}
