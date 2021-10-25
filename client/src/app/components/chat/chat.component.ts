import { IReceiveMessagePayload } from '../../model/IReceiveMessagePayload.model';
import { merge, Subscription } from 'rxjs';
import { SocketService } from '../../services/chat/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatService } from 'src/app/services/chat/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @ViewChild('messageContainer', { static: true }) messageContainer!: ElementRef;
  @ViewChildren("messagesList") messagesList!: QueryList<ElementRef>
  
  messages: IReceiveMessagePayload[];
  message: string;
  errorListener: Subscription;
  public readonly systemUsername = "Système"
  messageListener: Subscription;
  isVisible : boolean;
  constructor(
    private router: Router,
    private chatService: ChatService,
    private route: ActivatedRoute,
    public socketService: SocketService
  ) {
    this.message = "";
    this.messages = [];
    this.isVisible = true;
    this.errorListener = new Subscription();
    this.messageListener = new Subscription();
  }

  ngOnInit(): void {
    this.errorListener = this.socketService.onError().subscribe((err: any) => {
      this.router.navigateByUrl("login");

      // Clean this up for the implementation of the chat feature
      if (err.message === 'xhr poll error') {
        this.socketService.error = "Oups, nous n'avons pas pu vous connecter au serveur... Essayez à nouveau plus tard !"
      } else this.socketService.error = err.message;

      this.socketService.disconnect();
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

  ngAfterViewInit(): void {
    this.messagesList.changes.subscribe((list: QueryList<ElementRef>) => {
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.errorListener.unsubscribe();
    this.messageListener.unsubscribe();
  }

  connectWithUsername() {
    const username = this.route.snapshot.queryParamMap.get("username")

    if (!username) {
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
    this.socketService.error = "";
    this.socketService.disconnect();
    this.router.navigateByUrl("login");
  }
  open(): void {
    this.chatService.openChatWindow();
    this.isVisible = false;

    }
  
  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
