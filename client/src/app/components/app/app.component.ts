import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from 'src/app/services/chat/socket.service';
import { environment } from 'src/environments/environment';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Colorimage';
  authSubscription: Subscription;
  constructor(private af: AngularFireAuth, private socketService: SocketService, private activeRoute: ActivatedRoute, private router: Router) {
    if (environment.useEmulator) {
      this.af.auth.useEmulator(environment.authEmulator)
    }

    const redirectTo = this.activeRoute.snapshot.queryParams.redirectTo;
    if (redirectTo) {
      this.router.navigateByUrl(redirectTo);
    }
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

}
