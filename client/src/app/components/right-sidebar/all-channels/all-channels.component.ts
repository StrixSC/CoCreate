import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { IChannel } from "src/app/model/IChannel.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";

import { MatSnackBar } from "@angular/material/snack-bar";
export interface DialogData {
  animal: "panda" | "unicorn" | "lion";
}

@Component({
  selector: "app-all-channels",
  templateUrl: "./all-channels.component.html",
  styleUrls: ["./all-channels.component.scss"],
})
export class AllChannelsComponent implements OnInit, OnChanges {
  all_channels: Map<string, IChannel>;
  channel_names: Set<string>;
  all_channel_dynamic_css: Object;

  newChannelView: Object;
  browseChannelView: Object;
  input_text: string;

  @Output() closeChannelsEvent = new EventEmitter<boolean>();
  @Output() joinChannelEvent = new EventEmitter<IChannel>();
  @Output() deleteChannelEvent = new EventEmitter<IChannel>();
  @Input() channelWidth: string;

  constructor(
    private channelManagerService: ChannelManagerService,
    private _snackBar: MatSnackBar
  ) {
    this.all_channels = new Map();
    this.channel_names = new Set();
    this.all_channel_dynamic_css = { width: "1200px" };
    this.browseChannelView = { display: "block" };
    this.newChannelView = { display: "none" };
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 1000,
    });
  }

  ngOnInit() {
    this.getChannels();
  }

  ngOnChanges() {
    this.all_channel_dynamic_css = { width: this.channelWidth };
  }

  getChannels() {
    this.all_channels.clear();
    this.channel_names.clear();
    this.channelManagerService.GetAllChannels().subscribe((data: any) => {
      data.forEach((element: IChannel) => {
        this.all_channels.set(element.channel_id, element);
        this.channel_names.add(element.name);
      });
    });
  }

  joinChannel(key: string) {
    let channel: IChannel | undefined = this.all_channels.get(key);
    if (channel) {
      channel.btnStyle = { "background-color": "#3aa55d", color: "white" };
      this.all_channels.set(key, channel);
      this.joinChannelEvent.emit(channel);
    }
  }

  closeChannelBar() {
    this.closeChannelsEvent.emit(false);
  }

  createNewChannel() {
    this.browseChannelView = { display: "none" };
    this.newChannelView = { display: "block" };
  }

  deleteChannel(channel_id: string) {
    console.log(channel_id);
    let channel: IChannel | undefined = this.all_channels.get(channel_id);
    if (channel) {
      this.channelManagerService.DeleteChannel(channel_id);
      setTimeout(() => {
        this.getChannels();
        this.deleteChannelEvent.emit(channel);
      }, 100);
    }
  }

  browseChannels() {
    this.browseChannelView = { display: "block" };
    this.newChannelView = { display: "none" };
  }

  createChannel() {
    this.channelManagerService.CreateChannel(this.input_text);
    setTimeout(() => {
      this.channel_names.add(this.input_text);
      this.getChannels();
      this.openSnackBar("Channel created!", "close");
      this.input_text = "";
      this.browseChannels();
    }, 100);
  }

  verifyText() {
    console.log(this.input_text);
    if (this.channel_names.has(this.input_text)) {
      this.openSnackBar("name already exists!", "close");
    } else {
      this.createChannel();
    }
  }
}
