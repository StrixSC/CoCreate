import { switchMap, take } from "rxjs/operators";
import { Component, OnDestroy } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { merge, Subscription, BehaviorSubject, of, EMPTY } from "rxjs";
import { HotkeysService } from "src/app/services/hotkeys/hotkeys.service";
import { NewDrawingComponent } from "../new-drawing/new-drawing.component";
import { WelcomeDialogComponent } from "../welcome-dialog/welcome-dialog/welcome-dialog.component";
import { SocketService } from "./../../services/chat/socket.service";

@Component({
  selector: "app-drawing-page",
  styleUrls: ["./drawing-page.component.scss"],
  templateUrl: "./drawing-page.component.html",
})
export class DrawingPageComponent implements OnDestroy {
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  errorListener: Subscription;

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService
  ) {
    this.hotkeyService.hotkeysListener();
  }

  async ngOnInit() {
    this.errorListener = this.socketService.socketReadyEmitter
      .pipe(
        take(1),
        switchMap((ready: boolean) => {
          if (ready) {
            return merge(
              this.socketService.onException(),
              this.socketService.onError()
            );
          } else {
            return of(EMPTY);
          }
        })
      )
      .subscribe((data) => {
        console.log(data);
      });
  }

  openDialog() {
    this.welcomeDialogRef = this.dialog.open(WelcomeDialogComponent, {
      hasBackdrop: true,
      panelClass: "filter-popup",
      autoFocus: false,
      disableClose: true,
      maxHeight: 500,
      maxWidth: 500,
    });
    this.welcomeDialogSub = this.welcomeDialogRef
      .afterClosed()
      .subscribe(() => {
        this.dialog.open(NewDrawingComponent);
      });
  }

  ngOnDestroy(): void {
    if (this.welcomeDialogSub) {
      this.welcomeDialogSub.unsubscribe();
    }

    if (this.errorListener) {
      this.errorListener.unsubscribe();
    }
  }
}
