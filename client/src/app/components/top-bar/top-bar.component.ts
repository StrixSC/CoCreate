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
export class TopBarComponent implements OnInit, OnDestroy, OnChanges {

  messageListener: Subscription;

  public isLoading: boolean = false;
  private authSubscription: Subscription;
  private logoutSubscription: Subscription;
  constructor(public auth: AuthService, private router: Router, private syncCollaboration: SyncCollaborationService, private socketService: SocketService,
    private af: AngularFireAuth) { }

  ngOnInit() {
    this.authSubscription = this.auth.authState.subscribe((state) => {
      if (state) {
        this.auth.activeUser = state;
        this.isLoading = false;
        console.log(state);
      }
    }, (error) => {
      console.error(error);
    })
    // this.afSubscription = this.af.authState.subscribe(user => {
    //   if (user) {
    //     this.user = user;
    //     this.loading = false;
    //     // this.syncCollaboration.sendJoin(this.user.uid, 'DEMO_COLLABORATION', "Public");
    //     //this.syncCollaboration.sendJoin(this.user.uid,'DEMO_COLLABORATION','Public');
    //     this.syncCollaboration.sendConnect(this.user.uid, 'DEMO_COLLABORATION');
    //   }
    // });
    // this.messageListener = this.socketService.socketReadyEmitter
    //   .pipe(
    //     take(1),
    //     switchMap((ready: boolean) => {
    //       if (ready && !this.loading) {
    //         return merge(
    //           this.syncCollaboration.onJoinCollaboration(),
    //           this.syncCollaboration.onConnectCollaboration(),
    //           this.syncCollaboration.onCreateCollaboration(),
    //           this.syncCollaboration.onDeleteCollaboration(),
    //           this.syncCollaboration.onUpdateCollaboration(),
    //           this.syncCollaboration.onLoadCollaboration()
    //         )
    //       } else {
    //         console.log("hey 2")
    //         return of(EMPTY);
    //       }
    //     })
    //   ).subscribe((data: any) => {
    //     console.log(data)
    //   })
  }

  ngOnChanges() {
    this.listenJoin();
    this.listenConnect();
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

  public listenJoin() {
    this.syncCollaboration
      .onJoinCollaboration()
      .subscribe((data) => {
        console.log(data);
      });
  }
  public listenConnect() {
    this.syncCollaboration
      .onConnectCollaboration()
      .subscribe((data) => {
        console.log(data);
      });
  }

  public updateCollaboration(paramChoice: string) {
    //this.syncCollaboration.sendUpdateCollaboration(paramChoice)
  }

  logout(): void {
    this.auth.signOut().subscribe(() => {
      this.router.navigateByUrl('auth');
    })
  }

}
