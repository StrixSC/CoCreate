import { Router } from '@angular/router';
import { SocketService } from './../../../services/chat/socket.service';
import { IUser } from './../../../model/IUser.model';
import { Component } from "@angular/core";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-welcome-page",
  templateUrl: "./welcome-page.component.html",
  styleUrls: ["./welcome-page.component.scss"],
})
export class WelcomePageComponent {
  user = {
    email: "",
    password: ""
  };

  logInFail: boolean = false;
  loading: boolean = false;

  constructor(public userService: UserService, private socketService: SocketService, private router: Router) {}

  onSubmit() {
    if(this.loading) return; 

    this.loading = true;
    this.userService.login(this.user).subscribe((user: IUser) => {
      this.userService.user = user;
      this.loading = false;
      this.router.navigateByUrl('drawing');
      this.socketService.connect();
    }, (error: Error | any) => {
      console.error(error);
      this.loading = false;
    })
  }

}
