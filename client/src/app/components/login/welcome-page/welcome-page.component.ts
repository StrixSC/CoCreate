import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuthService } from './../../../services/auth.service';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
})
export class WelcomePageComponent {
  user = {
    email: '',
    password: '',
  };

  loading = false;
  loginSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router) { }

  signIn() {
    if (this.loading) { return; }
    this.loading = true;

    this.loginSubscription = this.authService.signIn(this.user).pipe(mergeMap((data) => {
      return this.authService.logUserConnection();
    })).subscribe((data) => {
      console.log(data);
      this.loading = false;
      this.router.navigateByUrl('drawing');
    }, (error) => {
      console.error(error);
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

}
