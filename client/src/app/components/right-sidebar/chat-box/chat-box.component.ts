import { environment } from "src/environments/environment";
import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
} from "@angular/core";
import { ChatSocketService } from "src/app/services/chat/chat.service";
import { HttpClient } from "@angular/common/http";
import { IReceiveMessagePayload } from "src/app/model/IReceiveMessagePayload.model";
import { ChannelManagerService } from "src/app/services/chat/ChannelManager.service";
import { IChannelPayload } from "src/app/model/IChannelPayload.model";
import { IpcService } from "src/app/services/notification-manager/IPCManager.service";

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
export class ChatBoxComponent implements OnChanges, AfterViewInit {
  chatBoxName: string;
  myChannelID: string;
  messagesSet: Set<string>;
  @Output() closeChatEvent = new EventEmitter<boolean>();

  @Input() channel_id: string;

  @ViewChild("messageBox", { static: true })
  messageBox: ElementRef<HTMLInputElement>;

  @ViewChildren("messagesList")
  messagesWatcher!: QueryList<ElementRef>;

  currentText: string;

  messages: Array<Message>;
  constructor(
    private chatSocketService: ChatSocketService,
    private http: HttpClient,
    private channelManagerService: ChannelManagerService,
    private ipcService: IpcService
  ) {
    this.messagesSet = new Set();
    this.messages = [];
  }
  ngAfterViewInit(): void {
    this.messagesWatcher.changes.subscribe(() => {
      this.scrollToBottom();
    });
  }

  ngOnChanges() {
    this.initialize();
  }

  loadChannelMessages(channelID: string) {
    this.http
      .get(environment.serverURL + "/api/channels/" + channelID + "/messages")
      .subscribe((data: any) => {
        data.forEach((m: any) => {
          this.messages.push({
            message: m.message_data,
            avatar: m.avatar_url,
            username: m.username,
            time: m.timestamp,
          });
          console.log(m.avatar_url);
        });
      });
  }

  initialize() {
    if (!this.channel_id) return;
    this.messages = [];
    this.channelManagerService
      .GetChannelById(this.channel_id)
      .subscribe((data: IChannelPayload) => {
        this.chatBoxName = data.name;
      });

    this.loadChannelMessages(this.channel_id);
    this.listenToNewMessages();
  }

  listenToNewMessages() {
    this.chatSocketService.joinChannel(this.channel_id);
    this.chatSocketService
      .receiveMessage()
      .subscribe((data: IReceiveMessagePayload) => {
        if (!this.messagesSet.has(data.messageId)) {
          this.messages.push({
            message: data.message,
            avatar: data.avatarUrl,
            username: data.username,
            time: data.createdAt,
          });
          this.messagesSet.add(data.messageId);
          if (this.messagesSet.size > 20) this.messagesSet.clear();
        }
      });
  }

  scrollToBottom(): void {
    try {
      this.messageBox.nativeElement.scrollTop =
        this.messageBox.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    if (this.currentText.length > 0) {
      this.ipcService.send(`#${this.chatBoxName}`, this.currentText);
      this.chatSocketService.sendMessage(this.channel_id, this.currentText);
      this.currentText = "";
    }
  }

  popOutChat() {
    window.open(
      "http://localhost:4200/#/popped-chat/" + this.channel_id,
      "_blank",
      "toolbar=no,scrollbars=no,resizable=yes,top=100,left=500,width=800,height=1000,addressbar=no"
    );
    this.closeChat();
  }

  closeChat() {
    this.closeChatEvent.emit(false);
  }
}
