import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NewDrawingFormDialogComponent } from './../new-drawing-form-dialog/new-drawing-form-dialog.component';
import { ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { AuthService } from './../../services/auth.service';
import { AfterViewInit, Component, OnDestroy, Input, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatTabGroup, PageEvent } from '@angular/material';
import { merge, Subscription, timer } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { map } from 'rxjs/operators';

export enum DrawingTypes {
  Protected = 'Protected',
  Public = 'Public',
  Private = 'Private'
}

export enum GalleryEvents {
  Any = 'Any',
  Exception = "Exception",
  Load = 'Load',
  Delete_Finished = "Delete_Finished",
  Leave_Finished = "Leave_Finished",
  Join_Finished = "Join_Finished",
  Create_Finished = "Create_Finished",
  Connection_Finished = "Connection_Finished",
  Disconnection_Finished = "Disconnection_Finished",
}

@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})

export class DrawingGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() self = 'self';
  @Input() all = 'all';
  messageListener: Subscription;
  selfListener: Subscription;
  dialogRef: MatDialogRef<any>;
  drawings: IGalleryEntry[];
  activeOffset: number = 0;
  activeLimit: number = 12;
  totalCount: number = 0;
  animationIsDone: boolean = true;

  @ViewChild('tabGroup', { static: false }) tabs: MatTabGroup;

  isLoading: boolean = false;

  selectedOption: string = '';
  selectedOptionAll: string = '';
  activeFilter: string = '';
  selectedType: string = '';

  private drawingsSubscription: Subscription;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;

  drawingsEntry: IGalleryEntry[] = []

  public visibilityFilter: { key: string, value: string }[] =
    [
      {
        key: '',
        value: "Tous les types",
      },
      {
        key: DrawingType.Public,
        value: "Public",
      },
      {
        key: DrawingType.Private,
        value: "Privé",
      },
      {
        key: DrawingType.Protected,
        value: "Protégé"
      }
    ];

  public visibilityAllFilter: { key: string, value: string }[] =
    [
      {
        key: '',
        value: "Tous les types",
      },
      {
        key: DrawingType.Public,
        value: "Public",
      },
      {
        key: DrawingType.Protected,
        value: "Protégé"
      }
    ];

  handlerCallbacks: Record<GalleryEvents, (data: any) => any> = {
    Load: (data: ICollaborationLoadResponse) => this.onLoad(data),
    Any: () => this.filter(),
    Exception: (data: any) => this.showSnackbar(data.message),

    Delete_Finished: (data: any) => {
      this.switchToPublicIfNoDrawings();
      this.resetPaginationValues();
      this.showSnackbar("Dessin supprimé avec succès.");
    },

    Leave_Finished: (data: any) => {
      this.switchToPublicIfNoDrawings();
      this.resetPaginationValues();
      this.showSnackbar("Succès! Dessin quitté!")
    },

    Join_Finished: (data: any) => this.showSnackbar("Succès! Vous avez rejoint la liste de collaborateur du dessin. Vous pouvez y accéder en allant dans la section 'Mes Dessins'"),
    Create_Finished: (data: any) => {
      const MY_DRAWINGS = 1;
      this.tabs.selectedIndex = MY_DRAWINGS;
      this.showSnackbar("Succès! Le dessin à bien été créé!")
    },
    Connection_Finished: (data: any) => this.showSnackbar("Succès! Connection au dessin établie!"),
    Disconnection_Finished: (data: any) => this.showSnackbar("Succès! Déconnection du dessin terminée"),
  }

  switchToPublicIfNoDrawings() {
    if (this.drawings.length <= 0) {
      this.tabs.selectedIndex = 0;
    }
  }

  showSnackbar(message: string) {
    this.snackbar.open(message, "OK", { duration: 5000 });
  }

  onTabChange() {
    this.isLoading = true;
  }

  onLoad(data: ICollaborationLoadResponse) {
    if (this.dialogRef) this.dialogRef.close();
    this.router.navigateByUrl('drawing');
  }

  constructor(
    private snackbar: MatSnackBar,
    public drawingService: DrawingService,
    public dialog: MatDialog,
    private drawingGalleryService: DrawingGalleryService,
    private syncCollaboration: SyncCollaborationService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const createDrawing = this.route.snapshot.queryParams.createDrawing;
    if (createDrawing) {
      this.openDialog();
    }
  }

  ngOnDestroy(): void {
    if (this.messageListener) { this.messageListener.unsubscribe(); }
    if (this.drawingsSubscription) {
      this.drawingsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = "Dessins par page: ";
    this.paginator._intl.nextPageLabel = "Page suivante";
    this.paginator._intl.lastPageLabel = "Dernière page";
    this.paginator._intl.previousPageLabel = "Page précédente"
    this.paginator._intl.firstPageLabel = "Première page"

    this.messageListener = merge(
      this.syncCollaboration.onCreateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onJoinCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onUpdateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onLeaveCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onDeleteCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onConnectCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Exception }))),
      this.syncCollaboration.onDisconnectCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Any }))),
      this.syncCollaboration.onJoinException().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Exception }))),
      this.syncCollaboration.onLeaveException().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Exception }))),
      this.syncCollaboration.onCreateCollaborationException().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Exception }))),
      this.syncCollaboration.onDisconnectCollaborationException().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Exception }))),
      this.syncCollaboration.onJoinFinished().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Join_Finished }))),
      this.syncCollaboration.onCreateCollaborationFinished().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Create_Finished }))),
      this.syncCollaboration.onLeaveFinished().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Leave_Finished }))),
      this.syncCollaboration.onDisconnectCollaborationFinished().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Disconnection_Finished }))),
    ).subscribe((data: object & { eventType: GalleryEvents }) => {
      try {
        this.handlerCallbacks[data.eventType](data);
      } catch (e) {
        console.log('Not implemented Yet');
      }
    });

    this.filter();
  }

  filter(): void {
    this.isLoading = true;
    this.drawings = [];
    const MY_DRAWINGS = 1;
    let query = "?";
    query += this.activeFilter ? `filter=${this.activeFilter}&` : "";
    query += ['Public', 'Protected', 'Private'].includes(this.selectedOption) ? `type=${this.selectedOption}&` : "";
    query += this.activeOffset ? `offset=${this.activeOffset}&` : "";
    query += this.activeLimit ? `limit=${this.activeLimit}&` : "";

    if (query.length === 1) {
      query = "";
    }

    let selectedTab = MY_DRAWINGS;
    if (!this.tabs.selectedIndex) {
      selectedTab = 0;
    }

    this.drawingGalleryService
      .filterDrawings(selectedTab === MY_DRAWINGS, query)
      .subscribe((d: { drawings: IGalleryEntry[]; total_drawing_count: number; offset: number; limit: number; }) => {
        if (d) {
          for (let drawing of d.drawings) {
            if (drawing.thumbnail_url) {
              new Image().src = drawing.thumbnail_url;
            }
          }
          this.isLoading = false;
          this.drawings = d.drawings;
          this.totalCount = d.total_drawing_count;
          this.activeOffset = d.offset;
          this.activeLimit = d.limit;
        }
      });
  }

  onSelectedTabChange(): void {
    this.animationIsDone = false;
    this.filter();
  }

  animationDone(): void {
    this.animationIsDone = true;
  }

  openDialog(): void {
    if (!this.auth.activeUser) {
      return;
    }

    this.dialogRef = this.dialog.open(NewDrawingFormDialogComponent,
      {
        autoFocus: false,
        width: '800px', height: '800px',
      });
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex;
    this.activeOffset = (pageIndex * this.activeLimit);
    this.filter();
  }

  resetPaginationValues(): void {
    this.paginator.firstPage();
    this.activeLimit = 12;
    this.activeOffset = 0;
  }

}