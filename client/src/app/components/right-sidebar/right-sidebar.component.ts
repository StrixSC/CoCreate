import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { merge, Subscription } from "rxjs";

export interface TextChannel {
  name: string;
  style?: Object;
  divStyle?: Object;
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
  messageListener: Subscription;

  constructor() {
    this.textChannels = new Map();
    this.selectedChannel = "general";
    this.textChannels.set("general", {
      name: "general",
    });

    this.textChannels.set("Second", {
      name: "new-channel",
    });

    this.textChannels.set("another", {
      name: "old-channel",
    });

    this.textChannels.set("s", {
      name: "a-channel",
    });

    this.prevJoinedCollabChannels = [
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
      "Équipe 109",
    ];
  }

  ngOnInit() {}
}
