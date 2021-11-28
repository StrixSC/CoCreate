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

  authSubscription: Subscription
  constructor(private auth: AuthService, private router: Router) { }

  openDrawingGallery(): void {
    this.router.navigateByUrl("gallery")
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
