import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { IChannel } from "src/app/model/IChannel.model";

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
  animal: string;
  name: string;
  selectedChannel: string;
  messageListener: Subscription;
  errorListener: Subscription;
  channel: IChannel;

  constructor(private http: HttpClient) {
    this.textChannels = new Map();
    this.errorListener = new Subscription();
    this.messageListener = new Subscription();
  }

  ngOnInit(): void {
    this.getChannels();
  }

  getChannels() {
    this.http
      .get("https://colorimage-109-3900.herokuapp.com/api/channels/")
      .subscribe((data: any) => {
        data.forEach((element: IChannel) => {
          this.textChannels.set(element.channel_id, element);
          console.log(element);
        });
      });
  }

  changeChannel(channelID: string) {
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" + channelID
      )
      .subscribe((data: any) => {
        console.log(data);
      });
    this.selectedChannel = channelID;
    if (this.textChannels.has(channelID)) {
      this.channel = this.textChannels.get(channelID) as IChannel;
    }
  }
}
