import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

export interface DialogData {
  animal: string;
  name: string;
}

export interface TextChannel {
  name: string;
  style: Object;
}

@Component({
  selector: "app-right-sidebar",
  templateUrl: "./right-sidebar.component.html",
  styleUrls: ["./right-sidebar.component.scss"],
})
export class RightSidebarComponent implements OnInit {
  private textChannels: Map<String, TextChannel>;
  private prevJoinedCollabChannels: Array<String>;
  animal: string;
  name: string;
  selectedChannel: string;

  example = {
    color: "red",
  };

  constructor(public dialog: MatDialog) {
    this.textChannels = new Map();
    this.selectedChannel = "general";
    this.textChannels.set("general", {
      name: "general",
      style: {},
    });

    this.textChannels.set("Second", {
      name: "new-channel",
      style: {},
    });

    this.prevJoinedCollabChannels = [
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
    ];
  }

  addRecentChannels(room: string) {
    this.prevJoinedCollabChannels.push(room);
  }

  addDummyChannel(channel_key: string) {
    const change = this.textChannels.get(this.selectedChannel) as TextChannel;
    change.style = {};
    this.textChannels.set(this.selectedChannel, change);
    this.selectedChannel = channel_key;

    const old: TextChannel = this.textChannels.get(
      this.selectedChannel
    ) as TextChannel;
    old.style = {
      color: "white",
    };
    this.textChannels.set(this.selectedChannel, old);
  }

  ngOnInit() {}
}
