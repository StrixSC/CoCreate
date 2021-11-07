import { Router } from '@angular/router';
import { SocketService } from './../../services/chat/socket.service';
import { Subscriber, Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Colorimage";
  authSubscription: Subscription;
  constructor(private router: Router, private socketService: SocketService, private af: AngularFireAuth) {
    this.authSubscription = this.af.authState.subscribe((state) => {
      if(!state) {
        this.router.navigateByUrl('');
        this.socketService.disconnect();
      } else {
        this.socketService.setupSocketConnection();
      }
    })
  }

}
