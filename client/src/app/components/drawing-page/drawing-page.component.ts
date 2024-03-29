import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { v4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/storage';
import { ExportService } from 'src/app/services/export/export.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { SocketService } from 'src/app/services/chat/socket.service';
import { ToolFactoryService } from './../../services/tool-factory.service';
import { SyncDrawingService } from './../../services/syncdrawing.service';
import { DrawingLoadService } from './../../services/drawing-load.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { merge, Subscription, timer } from "rxjs";
import { HotkeysService } from "src/app/services/hotkeys/hotkeys.service";
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
  loadListener: Subscription;
  initSet: boolean;
  timer: Subscription;
  listener: Subscription;
  activeCollaborationId: string;
  collaborationDeletedSubscription: Subscription;
  committedAction: boolean;
  deletedListener: Subscription;
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
    private socketService: SocketService,
    private selectionService: SelectionToolService,
    private syncCollabService: SyncCollaborationService,
  ) {
    this.initSet = false;
    this.hotkeyService.hotkeysListener();
  }

  ngAfterViewInit(): void {
    this.committedAction = false;
    if (!this.drawingLoader.activeDrawingData) {
      const collaborationId = this.activeRoute.snapshot.params.id;
      if (collaborationId) {
        this.activeCollaborationId = collaborationId;
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
      this.init(this.drawingLoader.activeDrawingData);
    }
  }

  init(data?: ICollaborationLoadResponse): void {
    if (!this.drawingLoader.isLoaded) {
      if (data) {
        this.drawingLoader.activeDrawingData = data;
      }
      if (this.drawingLoader.activeDrawingData) {
        this.activeCollaborationId = this.drawingLoader.activeDrawingData.collaborationId;
        this.collaborationDeletedSubscription = this.syncCollabService.onDeleteCollaboration().subscribe((c: { collaborationId: string }) => {
          if (c.collaborationId === this.activeCollaborationId) {
            this.snackbar.open('Le dessin actif fut supprimé...', "OK", { duration: 5000 });
            this.router.navigateByUrl('gallery');
          }
        });
      }
      this.drawingLoader.loadDrawing();
      this.syncDrawingService.updatedDefaultPayload(this.drawingLoader.activeDrawingData!.collaborationId);
      this.listener = merge(
        this.socketService.on('drawing:exception').pipe(map((d) => ({ ...d, eventType: EventTypes.Exception }))),
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
          this.toolFactory.handleEvent(data);
          if (this.toolFactory.isActiveUser(data)) {
            this.committedAction = true;
          }
        } else {
          if (data.eventType === EventTypes.Error) {
            this.onError();
          } else {
            console.error(data);
          }
        }
      });
    }
    const ONE_MINUTE = 1000 * 60;
    this.timer = timer(ONE_MINUTE).subscribe((c) => {
      this.drawingLoader.exportThumbnail();
    })
  }

  ngOnDestroy(): void {
    if (this.loadListener) {
      this.loadListener.unsubscribe();
    }

    if (this.listener) {
      this.listener.unsubscribe();
    }

    if (this.committedAction) {
      this.selectionService.sendUnselect();
      this.syncCollabService.sendLogDrawingAction({ collaborationId: this.activeCollaborationId });
    }

    this.syncCollabService.sendDisconnect({ collaborationId: this.activeCollaborationId });
    this.activeCollaborationId = "";
    this.drawingLoader.unload();
  }

  onError(): void {
    this.snackbar.open(`Oups, quelque chose d'inattendu s'est produit lors de la communication avec le serveur...!`, "OK", { duration: 5000 });
    this.router.navigateByUrl('');
  }
}
