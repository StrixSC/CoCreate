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

@Component({
  selector: "app-right-sidebar",
  templateUrl: "./right-sidebar.component.html",
  styleUrls: ["./right-sidebar.component.scss"],
})
export class RightSidebarComponent implements OnInit {
  private textChannels: Array<String>;
  private prevJoinedCollabChannels: Array<String>;
  animal: string;
  name: string;

  constructor(public dialog: MatDialog) {
    this.textChannels = ["general"];
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

  addDummyChannel() {
    this.textChannels.push("Dummy Channel");
    console.log("new dummy");
  }

  ngOnInit() {}
}
