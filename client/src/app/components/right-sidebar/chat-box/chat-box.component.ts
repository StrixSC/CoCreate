import {
  Component,
  OnInit,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ChatService } from "src/app/services/chat/chat.service";
import { HttpClient } from "@angular/common/http";
import { Observable, Subscription } from "rxjs";
import { IChannel } from "src/app/model/IChannel.model";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";
import { IChannelPayload } from "src/app/model/IChannelPayload.model";

export interface MessageHeader {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

export interface Message {
  message: string;
  avatar: string;
  username: string;
  time: string;
}

@Component({
  selector: "app-chat-box",
  templateUrl: "./chat-box.component.html",
  styleUrls: ["./chat-box.component.scss"],
})
export class ChatBoxComponent implements OnInit, OnChanges, AfterViewInit {
  chatCss: any = { width: "300px" };
  chatBoxName: string;
  myChannelID: string;
  messagesList: Set<string>;
  @Input() channel_id: string;

  @ViewChild("messageBox", { static: true })
  messageBox: ElementRef<HTMLInputElement>;

  @ViewChildren("messagesList")
  messagesWatcher!: QueryList<ElementRef>;

  currentText: string;

  messages: Array<Message>;
  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private channelManagerService: ChannelManagerService
  ) {
    this.messagesList = new Set();
    this.messages = [];
  }
  ngAfterViewInit(): void {
    this.messagesWatcher.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }
  ngOnInit(): void {
    this.chatCss = { display: "none" };
  }

  loadChannelMessages(channelID: string) {
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" +
          channelID +
          "/messages"
      )
      .subscribe((data: any) => {
        console.log(data);
        data.forEach((m: any) => {
          this.messages.push({
            message: m.message_data,
            avatar: m.avatar_url,
            username: m.username,
            time: m.timestamp,
          });
        });
      });
  }

  initialize() {
    if (!this.channel_id) return;
    this.chatCss = { width: "300px" };
    this.messagesList.clear();
    this.messages = [];
    this.channelManagerService
      .GetChannelById(this.channel_id)
      .subscribe((data: IChannelPayload) => {
        this.chatBoxName = data.name;
        console.log(
          "receiving messages from ",
          this.channel_id,
          this.chatBoxName
        );
      });
    this.loadChannelMessages(this.channel_id);
  }

  listenToChannel() {}

  // ngOnChanges() {
  //   this.initialize();
  //   if (this.channel_object) {
  //     this.getMessagesFromChannel(this.myChannelID);

  // this.chatService
  //   .receiveMessage()
  //   .subscribe((data: IReceiveMessagePayload) => {
  //     console.log(data);
  //     if (
  //       !this.messagesList.has(data.messageId) &&
  //       data.channelId === this.myChannelID
  //     ) {
  //       this.messages.push({
  //         message: data.message,
  //         avatar: data.avatarUrl,
  //         username: data.username,
  //         time: data.createdAt,
  //       });
  //       this.messagesList.add(data.messageId);
  //     }
  //     if (this.messagesList.size > 20) this.messagesList.clear();
  //   });

  //     this.chatBoxName = this.channel_object.name;
  //     this.myChannelID = this.channel_object.channel_id;
  //     this.chatService.joinChannel(this.channel_object.channel_id);
  //   }
  // }

  ngOnChanges() {
    this.initialize();
    // this.chatService.receiveMessage().subscribe((data) => {
    //   console.log(data);
    // });
  }
  scrollToBottom(): void {
    try {
      this.messageBox.nativeElement.scrollTop =
        this.messageBox.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    if (this.currentText.length > 0) {
      console.log(
        "Sending to channel: ",
        this.chatBoxName,
        "\nChannelID: ",
        this.channel_id,
        "\nMessage:",
        this.currentText
      );
      this.chatService.sendMessage(this.channel_id, this.currentText);
      this.currentText = "";
    }
  }

  popOutChat() {
    window.open(
      "http://localhost:4200/popped-chat/" + this.channel_id,
      "_blank",
      "toolbar=no,scrollbars=no,resizable=yes,top=100,left=500,width=800,height=1000,addressbar=no"
    );
    this.chatCss = { display: "none" };
  }
}
