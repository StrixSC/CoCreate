import { ChatSidebarService } from './../../services/chat-sidebar.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { combineLatest, of, Subscription, merge } from 'rxjs';
import { switchMap, mergeMap, map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/chat/socket.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit, OnDestroy {
  showFiller = false;
  messageListener: Subscription;
  public isLoading: boolean = false;
  private authSubscription: Subscription;
  private initExceptionSubscription: Subscription;
  private logoutSubscription: Subscription;
  constructor(private snackBar: MatSnackBar,
    private chatsideBar: ChatSidebarService,
    public auth: AuthService, private router: Router, private socketService: SocketService,
    private af: AngularFireAuth) { }

  ngOnInit() {
    this.isLoading = true;
    this.authSubscription = this.auth.authState.pipe(mergeMap(async (state) => {
      if (state) {
        this.auth.activeUser = state;
        await this.socketService.setupSocketConnection();
        return { result: true, message: "", redirect: false, };
      } else return { result: false, message: "Erreur: Vous n'êtes pas authentifié.", redirect: false }
    }), switchMap((status) => {
      if (status.result) {
        this.socketService.sendInit();
        return merge(
          this.socketService.onInit().pipe(map(() => ({ result: true, message: "", redirect: false, }))),
          this.socketService.onInitException().pipe(map((d) => ({ result: false, message: d.message, redirect: true })))
        )
      } else return of(status);
    })).subscribe((status) => {
      if (status.result) {
        this.isLoading = false;
      } else if (!status.result && status.redirect) {
        this.router.navigateByUrl(`server-error?message=${status.message}`)
      } else if (!status.result) {
        this.snackBar.open(status.message, "OK", { duration: 5000 });
      }
    }, (error) => {
      this.snackBar.open(`Oh non! On dirait qu'il y a eu une erreur lors de la connexion à notre serveur, veuillez rafraichir l'application...`, "OK", { duration: 5000 });
    });
  }

  get isOpen(): boolean {
    return this.chatsideBar.navOpen;
  }

  ngOnDestroy() {
    if (this.messageListener) { this.messageListener.unsubscribe(); }
    if (this.initExceptionSubscription) {
      this.initExceptionSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }

  }

  logout(): void {
    if (this.socketService.socket) {
      this.socketService.disconnect();
    }

    this.auth.signOut().subscribe(() => {
      this.router.navigateByUrl('auth');
    })
  }

}
