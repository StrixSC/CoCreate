import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { EMPTY, merge, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { SocketService } from 'src/app/services/chat/socket.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit, OnDestroy {

  messageListener: Subscription;
  public isLoading: boolean = false;
  private authSubscription: Subscription;
  private logoutSubscription: Subscription;
  constructor(public auth: AuthService, private router: Router, private syncCollaboration: SyncCollaborationService, private socketService: SocketService,
    private af: AngularFireAuth) { }

  ngOnInit() {
    this.isLoading = true;
    this.authSubscription = this.auth.authState.subscribe((state) => {
      if (state) {
        this.auth.activeUser = state;
        this.isLoading = false;
        this.authSubscription.unsubscribe();
      }
    }, (error) => {
      console.error(error);
    });
  }

  ngOnDestroy() {
    if (this.messageListener) { this.messageListener.unsubscribe(); }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }

  }

  logout(): void {
    this.auth.signOut().subscribe(() => {
      this.router.navigateByUrl('auth');
    })
  }

}
