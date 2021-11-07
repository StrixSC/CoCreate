import { mergeMap } from 'rxjs/operators';
import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';
import { SocketService } from './../../../services/chat/socket.service';
import { Component } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { Subscription, merge } from 'rxjs';

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

  loading: boolean = false;
  loginSubscription: Subscription;

  constructor(public userService: UserService, private authService: AuthService, private socketService: SocketService, private router: Router) { }

  signIn() {
    if (this.loading) return;
    this.loading = true;

    // this.loginSubscription = this.authService.signIn(this.user).subscribe((data) => {
    //   if(data) {
    //     this.authService.logUserConnection().subscribe((data) => {
    //       this.router.navigateByUrl("drawing");
    //     });
    //     this.loginSubscription.unsubscribe();
    //     this.loading = false;
    //   }
    // }, (error) => {
    //   this.loading = false;
    //   console.error(error);
    // })

    this.loginSubscription = this.authService.signIn(this.user).pipe(mergeMap((data) => {
      return this.authService.logUserConnection();
    })).subscribe((data) => {
      console.log(data);
      this.loading = false;
      this.router.navigateByUrl('drawing');
    }, (error) => {
      console.error(error);
    })
  }

  ngOnDestroy(): void {
    if(this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

}
