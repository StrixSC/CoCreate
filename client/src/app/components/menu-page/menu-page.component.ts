import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSliderChange } from '@angular/material';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss']
})
export class MenuPageComponent implements OnDestroy {
  activeUser: firebase.User | null;
  authSubscription: Subscription;
  menuSound: HTMLAudioElement;

  constructor(private auth: AuthService, private router: Router) {
    this.activeUser = this.auth.activeUser;
    this.menuSound = new Audio();
    this.menuSound.src = "assets/bg.mp3"
    this.menuSound.loop = true;
    this.menuSound.volume = 0.1;
    this.menuSound.play();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.menuSound.muted = true;
  }

  async logout() {
    await this.auth.signOut().toPromise();
    this.router.navigate(['auth']);
  }

}
