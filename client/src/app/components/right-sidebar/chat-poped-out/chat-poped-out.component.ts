import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IChannel } from "src/app/model/IChannel.model";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChatService } from "src/app/services/chat/chat.service";

export interface Message {
  message: string;
  avatar: string;
  username: string;
  time: string;
}

@Component({
  selector: "app-chat-poped-out",
  templateUrl: "./chat-poped-out.component.html",
  styleUrls: ["./chat-poped-out.component.scss"],
})
export class ChatPopedOutComponent implements OnInit, OnChanges, AfterViewInit {
  chatBoxName: string;
  alreadySubbed: boolean;
  messagesList: Set<string>;
  @Input() channel_object: IChannel;

  @ViewChild("messageBox", { static: true })
  messageBox: ElementRef<HTMLInputElement>;

  @ViewChildren("messagesList")
  messagesWatcher!: QueryList<ElementRef>;
  messages: Array<Message>;
  currentText: string;
  channel_id: string;

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.messagesList = new Set();
    this.messages = [];
    this.alreadySubbed = false;
  }
  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.messagesWatcher.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom(): void {
    try {
      this.messageBox.nativeElement.scrollTop =
        this.messageBox.nativeElement.scrollHeight;
    } catch (err) {}
  }

  getMessagesFromChannel(channelID: string) {
    this.messages = [];
    this.http
      .get(
        "https://colorimage-109-3900.herokuapp.com/api/channels/" +
          channelID +
          "/messages"
      )
      .subscribe((data: any) => {
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

  ngOnChanges() {}

  sendMessage() {
    if (this.currentText.length > 0) {
      this.chatService.sendMessage(this.channel_id, this.currentText);
      this.currentText = "";
    }
  }

  ngOnInit() {
    this.route.params.subscribe((channel: { id: string }) => {
      this.channel_id = channel.id;
      this.getMessagesFromChannel(this.channel_id);
      this.scrollToBottom();
      this.chatService.joinChannel(this.channel_id);
      this.chatService
        .receiveMessage()
        .subscribe((data: IReceiveMessagePayload) => {
          this.messages.push({
            message: data.message,
            avatar: data.avatarUrl,
            username: data.username,
            time: data.createdAt,
          });
          this.messagesList.add(data.messageId);
        });

      this.chatBoxName = this.channel_object.name;
    });
  }
}
