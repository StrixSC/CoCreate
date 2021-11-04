import { Subscription } from 'rxjs';
import { SocketService } from "../../services/chat/socket.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "Colorimage";

  errorSubscription: Subscription;
  exceptionSubscription: Subscription;

  constructor(
    private socketService: SocketService
  ) {
    this.socketService.setupSocketConnection();
  }

  ngOnInit(): void {
    this.errorSubscription = this.socketService.onError().subscribe((err: Error | any) => {
      console.error(err);
    }, (err) => {
      console.error(err);
    });

    // Handle exceptions here. Logic needs to be separated for each specific exception.
    this.exceptionSubscription = this.socketService.onException().subscribe((err: Error | any) => {
      console.error(err);
    }, (err) => {
      console.error(err);
    })
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
