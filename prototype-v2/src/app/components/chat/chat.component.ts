import { IReceiveMessagePayload } from './../../models/IReceiveMessagePayload.model';
import { merge, Subscription } from 'rxjs';
import { SocketService } from './../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  messages: IReceiveMessagePayload[];
  message: string;
  errorListener: Subscription;
  messageListener: Subscription;
  constructor(
    private router: Router,
    private chatService: ChatService,
    private route: ActivatedRoute,
    public socketService: SocketService
  ) {
    this.message = "";
    this.messages = [];
    this.errorListener = new Subscription();
    this.messageListener = new Subscription();
  }

  ngOnInit(): void {
    this.errorListener = this.socketService.onError().subscribe((err: any) => {
      console.log(err.message);
      this.router.navigateByUrl("login");
      this.socketService.disconnect();
      this.socketService.error = "Username invalide";
    });

    this.messageListener = merge(
      this.chatService.userConnection(),
      this.chatService.userDisconnect(),
      this.chatService.receiveMessage(),
    ).subscribe((data: IReceiveMessagePayload) => {
        this.messages.push(data);
        this.scrollToBottom();
      });
    this.connectWithUsername();
  }

  ngOnDestroy() : void {
    this.errorListener.unsubscribe();
    this.messageListener.unsubscribe();
    this.disconnect();
  }

  connectWithUsername() {
    const username = this.route.snapshot.queryParamMap.get("username")
    
    if(!username) {
      this.socketService.error = "Nom d'utilisateur invalide",
      this.router.navigateByUrl("login");
      return;
    }

    this.socketService.username = username;
    this.socketService.socket.auth = {
      username: username,
    }
    this.socketService.connect();
    this.chatService.joinChannel();
  }

  sendMessage(): void {
    this.chatService.sendMessage(this.message);
    this.message = "";
  }

  disconnect(): void {
    this.socketService.disconnect();
    this.router.navigateByUrl("login");
  }

  scrollToBottom(): void {
    try {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
}

}
