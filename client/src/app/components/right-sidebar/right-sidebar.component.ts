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
  divStyle: Object;
}

const l = "#36393F";

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
      divStyle: {},
    });

    this.textChannels.set("Second", {
      name: "new-channel",
      style: {},
      divStyle: {},
    });

    this.textChannels.set("another", {
      name: "old-channel",
      style: {},
      divStyle: {},
    });

    this.textChannels.set("s", {
      name: "a-channel",
      style: {},
      divStyle: {},
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
    const old = this.textChannels.get(this.selectedChannel) as TextChannel;
    old.style = {};
    old.divStyle = {};
    this.textChannels.set(this.selectedChannel, old);
    this.selectedChannel = channel_key;

    const new_select: TextChannel = this.textChannels.get(
      this.selectedChannel
    ) as TextChannel;
    new_select.style = {
      color: "white",
      padding: "5px",
      "margin-right": "5px",
      "margin-top": "0px",
    };
    new_select.divStyle = {
      "margin-left": "10px",
      "margin-right": "10px",
      "margin-top": "-12px",
      "background-color": "#393c43",
      height: "30px",
      "border-radius": "7px",
      cursor: "pointer",
      "animation-duration": "4s",
    };
    this.textChannels.set(this.selectedChannel, new_select);
    console.log(this.selectedChannel);
  }

  ngOnInit() {}
}
