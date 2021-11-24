import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SocketService } from 'src/app/services/chat/socket.service';
import { ToolFactoryService } from './../../services/tool-factory.service';
import { SyncDrawingService } from './../../services/syncdrawing.service';
import { DrawingLoadService } from './../../services/drawing-load.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { merge, Subscription } from "rxjs";
import { HotkeysService } from "src/app/services/hotkeys/hotkeys.service";
import { NewDrawingComponent } from "../new-drawing/new-drawing.component";
import { WelcomeDialogComponent } from "../welcome-dialog/welcome-dialog/welcome-dialog.component";
import { map } from 'rxjs/operators';
import { ICollaborationLoadResponse } from 'src/app/model/ICollaboration.model';
import { EventTypes } from '../canvas/canvas.component';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: "app-drawing-page",
  styleUrls: ["./drawing-page.component.scss"],
  templateUrl: "./drawing-page.component.html",
})
export class DrawingPageComponent {
  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  loadListener: Subscription;
  listener: Subscription;

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private drawingLoader: DrawingLoadService,
    private syncService: SyncCollaborationService,
    private syncDrawingService: SyncDrawingService,
    private toolFactory: ToolFactoryService,
    private activeRoute: ActivatedRoute,
    private snackbar: MatSnackBar,
    private router: Router,
    private socketService: SocketService
  ) {
    this.hotkeyService.hotkeysListener();
  }

  ngAfterViewInit(): void {
    if (!this.drawingLoader.activeDrawingData) {
      const collaborationId = this.activeRoute.snapshot.params.id;
      if (collaborationId) {

        this.syncService.sendConnectCollaboration({
          userId: '',
          collaborationId
        });

        this.loadListener = this.syncService.onLoadCollaboration().subscribe((data) => {
          this.init(data);
          this.loadListener.unsubscribe();
        });

      } else {
        this.onError();
      }
    } else {
      this.init();
    }
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

  init(data?: ICollaborationLoadResponse): void {
    if (!this.drawingLoader.isLoaded) {
      if (data) {
        this.drawingLoader.activeDrawingData = data;
      }
      this.drawingLoader.loadDrawing();
      this.listener = merge(
        this.socketService.onException().pipe(map((d) => ({ ...d, eventType: EventTypes.Exception }))),
        this.socketService.onError().pipe(map((d) => ({ ...d, eventType: EventTypes.Error }))),
        this.syncDrawingService.onFreedraw().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onSelection().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onShape().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onUndoRedo().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onDelete().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onTranslate().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onRotate().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onResize().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onText().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onLayer().pipe(map((d) => ({ ...d, eventType: EventTypes.Action }))),
        this.syncDrawingService.onActionSave().pipe(map((d) => ({ ...d, eventType: EventTypes.Action })))
      ).subscribe((data: any & { eventType: string }) => {
        if (data.eventType === EventTypes.Action) {
          console.log('Event received from user', data.username, 'with type', data.actionType);
          this.toolFactory.handleEvent(data);
        } else {
          if (data.eventType === EventTypes.Error) {
            this.onError();
          }
          console.error(data);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.loadListener) {
      this.loadListener.unsubscribe();
    }

    this.drawingLoader.activeDrawingData = null;
    this.drawingLoader.isLoaded = false;
    this.drawingLoader.isLoading = false;
  }

  onError(): void {
    this.snackbar.open(`Oups, quelque chose s'est produit lors de la génération du dessin. SVP Essayez à nouveau!`);
    this.router.navigateByUrl('');
  }
}
