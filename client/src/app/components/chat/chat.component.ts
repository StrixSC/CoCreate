import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { IMessageResponse, IChannelResponse, ISidebarChannel } from './../../model/IChannel.model';
import { Subscription } from 'rxjs';
import { ChatSocketService } from 'src/app/services/chat/chat.service';
import { ChatSidebarService } from './../../services/chat-sidebar.service';
import { Component, OnInit, ElementRef, ViewChild, isDevMode } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {

  @ViewChild("messageBox", { static: false })
  messageBox: ElementRef<HTMLDivElement>;

  constructor(private sidebarService: ChatSidebarService, private router: Router, private auth: AuthService, private chatService: ChatSocketService) { }

  message: string = "";

  openInNewWindow() {
    const winRef: Window | null = window.open(
      "/#/chatbox/" + this.activeChannel.channel_id,
      "_blank",
      "toolbar=no,scrollbars=yes,resizable=0,menubar=1,width=450,height=800"
    );

    if (winRef !== null && winRef.location.href === "about:blank") {
      winRef.addEventListener("beforeunload", function (e) {
        e.preventDefault();
        e.returnValue = "";
      });
      winRef.location.href = "/#/chatbox/" + this.activeChannel.channel_id;
    }
  }

  isActiveUser(username: string): boolean {
    return this.auth.activeUser!.displayName! === username;
  }

  get isOpen(): boolean {
    return this.sidebarService.navOpen;
  }

  get isLoading(): boolean {
    return this.sidebarService.isLoading;
  }

  get activeChannel(): ISidebarChannel {
    return this.sidebarService.activeChannel;
  }

  onSubmit(): any {
    this.chatService.sendMessage(this.sidebarService.activeChannel.channel_id, this.message);
    this.message = "";
  }
}
