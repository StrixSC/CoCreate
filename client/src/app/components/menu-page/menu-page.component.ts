import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.scss']
})
export class MenuPageComponent implements OnDestroy {
  activeUser: firebase.User |null;
  authSubscription: Subscription
  constructor(private auth: AuthService, private router: Router) {
    this.activeUser=this.auth.activeUser;
   }

  openDrawingGallery(): void {
    this.router.navigateByUrl("gallery")
  }

  openUserProfile():void {
    this.router.navigateByUrl("profile/"+this.activeUser!.displayName)
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async logout() {
    await this.auth.signOut().toPromise();
    this.router.navigate(['auth']);
  }

}
