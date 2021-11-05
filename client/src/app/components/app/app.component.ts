import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from "../../services/chat/socket.service";
import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Colorimage";

  constructor(
  ) {
  }

}
