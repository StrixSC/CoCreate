import { Point } from 'src/app/model/point.model';
import { IAction } from './../../model/action.model';
import { ToolFactoryService } from './../../services/synchronization/tool-factory.service';
import { SyncDrawingService } from './../../services/synchronization/syncdrawing.service';
import { switchMap, take } from "rxjs/operators";
import { Component, OnDestroy } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { merge, Subscription, BehaviorSubject, of, EMPTY } from "rxjs";
import { HotkeysService } from "src/app/services/hotkeys/hotkeys.service";
import { NewDrawingComponent } from "../new-drawing/new-drawing.component";
import { WelcomeDialogComponent } from "../welcome-dialog/welcome-dialog/welcome-dialog.component";
import { SocketService } from "./../../services/chat/socket.service";
import { ActionType } from 'src/app/model/IAction.model';

@Component({
  selector: "app-drawing-page",
  styleUrls: ["./drawing-page.component.scss"],
  templateUrl: "./drawing-page.component.html",
})
export class DrawingPageComponent implements OnDestroy {
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  errorListener: Subscription;
  messageListener: Subscription;

  constructor(
    private syncDrawingService: SyncDrawingService,
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService,
    private toolFactory: ToolFactoryService,
  ) {
    this.hotkeyService.hotkeysListener();
  }

  ngOnInit() {
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

    this.messageListener = this.socketService.socketReadyEmitter
      .pipe(
        take(1),
        switchMap((ready: boolean) => {
          if (ready) {
            return merge(
              this.socketService.on('freedraw:received'),
              this.socketService.on('shape:received'),
              this.socketService.on('selection:received')
            )
          } else {
            return of(EMPTY);
          }
        })
      ).subscribe((data) => {
        this.syncDrawingService.handleResponse(data);
      })
  }

  ngAfterViewInit(): void {
    const command = this.toolFactory.create({
      a: 1,
      r: 0,
      g: 0,
      b: 0,
      x: 0,
      y: 0,
      width: 3,
      actionType: ActionType.Freedraw,
      isSelected: true,
      offsets: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 8 }] as Point[],
    } as IAction);
    command.execute();
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
