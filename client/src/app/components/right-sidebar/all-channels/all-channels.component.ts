import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { IChannel } from "src/app/model/IChannel.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";

@Component({
  selector: "app-all-channels",
  templateUrl: "./all-channels.component.html",
  styleUrls: ["./all-channels.component.scss"],
})
export class AllChannelsComponent implements OnInit, OnChanges {
  all_channels: Map<string, IChannel>;
  all_channel_dynamic_css: Object;
  @Output() closeChannelsEvent = new EventEmitter<boolean>();

  @Input() channelWidth: string;

  constructor(private channelManagerService: ChannelManagerService) {
    this.all_channels = new Map();
    this.all_channel_dynamic_css = { width: "1200px" };
  }

  ngOnInit() {
    this.getChannels();
  }

  ngOnChanges() {
    this.all_channel_dynamic_css = { width: this.channelWidth };
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
