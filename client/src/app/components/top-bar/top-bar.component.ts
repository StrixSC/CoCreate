import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { EMPTY, merge, of, Subscription } from 'rxjs';
import { switchMap, take, mergeMap, concatMap, map } from 'rxjs/operators';
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
  constructor(private snackBar: MatSnackBar, public auth: AuthService, private router: Router, private socketService: SocketService,
    private af: AngularFireAuth) { }

  ngOnInit() {
    this.isLoading = true;
    this.authSubscription = this.auth.authState.pipe(mergeMap(async (state) => {
      if (state) {
        this.auth.activeUser = state;
        await this.socketService.setupSocketConnection();
        return { result: true, message: "" };
      } else return { result: false, message: "Erreur: Vous n'êtes pas authentifié." }
    }), switchMap((status) => {
      if (status.result) {
        this.socketService.sendInit();
        return this.socketService.onInit().pipe(map(() => ({ result: true, message: "" })))
      } else return of(status);
    })).subscribe((status) => {
      if (status.result) {
        this.isLoading = false;
      } else {
        this.snackBar.open(status.message, "OK", { duration: 5000 });
      }
    }, (error) => {
      this.snackBar.open(`Oh non! On dirait qu'il y a eu une erreur lors de la connexion à notre serveur, veuillez rafraichir l'application...`, "OK", { duration: 5000 });
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
