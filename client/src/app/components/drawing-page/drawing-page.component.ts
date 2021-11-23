import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { ToolFactoryService } from './../../services/tool-factory.service';
import { SyncDrawingService } from '../../services/syncdrawing.service';
import { switchMap, take } from "rxjs/operators";
import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { merge, Subscription, of, EMPTY } from "rxjs";
import { HotkeysService } from "src/app/services/hotkeys/hotkeys.service";
import { NewDrawingComponent } from "../new-drawing/new-drawing.component";
import { WelcomeDialogComponent } from "../welcome-dialog/welcome-dialog/welcome-dialog.component";
import { SocketService } from "./../../services/chat/socket.service";
import { SyncCollaborationService } from "src/app/services/syncCollaboration.service";

@Component({
  selector: "app-drawing-page",
  styleUrls: ["./drawing-page.component.scss"],
  templateUrl: "./drawing-page.component.html",
})
export class DrawingPageComponent implements OnDestroy, OnInit {
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  errorListener: Subscription;
  messageListener: Subscription;
  actionSavedListener: Subscription;

  constructor(
    private syncDrawingService: SyncDrawingService,
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService,
    private selectionService: SelectionToolService,
    private toolFactory: ToolFactoryService
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
              this.syncDrawingService.onFreedraw(),
              this.syncDrawingService.onSelection(),
              this.syncDrawingService.onShape(),
              this.syncDrawingService.onUndoRedo(),
              this.syncDrawingService.onDelete(),
              this.syncDrawingService.onTranslate(),
              this.syncDrawingService.onRotate(),
              this.syncDrawingService.onResize(),
              this.syncDrawingService.onText(),
              this.syncDrawingService.onLayer(),
              this.syncDrawingService.onActionSave()
            )
          } else {
            return of(EMPTY);
          }
        })
      ).subscribe((data: any) => {
        console.log('Event received from user', data.username, 'with type', data.actionType);
        this.toolFactory.handleEvent(data);
      })
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

    if (this.actionSavedListener) {
      this.actionSavedListener.unsubscribe();
    }
  }
}
