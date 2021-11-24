import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NewDrawingFormDialogComponent } from './../new-drawing-form-dialog/new-drawing-form-dialog.component';
import { ICollaborationConnectResponse, ICollaborationDeleteResponse, ICollaborationJoinResponse, ICollaborationLeaveResponse, ICollaborationUpdateResponse, ICollaborationCreateResponse, ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { AuthService } from './../../services/auth.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MatAutocomplete,
  MatDialog, MatPaginator, MatTableDataSource
} from '@angular/material';
import { BehaviorSubject, EMPTY, merge, Observable, of, Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { OpenDrawingService } from 'src/app/services/open-drawing/open-drawing.service';
import { Drawing } from '../../../../../common/communication/drawing';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { SocketService } from 'src/app/services/chat/socket.service';
import { switchMap, take, map } from 'rxjs/operators';
import { now } from 'moment';

export enum DrawingTypes {
  Protected = 'Protected',
  Public = 'Public',
  Private = 'Private'
}

export enum GalleryEvents {
  Join = 'Join',
  Leave = 'Leave',
  Load = 'Load',
  Delete = 'Delete',
  Connect = 'Connect',
  Update = 'Update',
  Create = 'Create',
}

const ONE_WEEK_NUMERIC_VALUE = 24 * 60 * 60 * 1000 * 7;

@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})

export class DrawingGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  pageIndex = 0;
  selectedTab = new FormControl(0);
  errorListener: Subscription;
  messageListener: Subscription;
  dialogRef: MatDialogRef<NewDrawingFormDialogComponent>;

  private drawingsSubscription: Subscription;

  datasourcePublic = new MatTableDataSource<IGalleryEntry>([]);
  datasourcePrivate = new MatTableDataSource<IGalleryEntry>([]);
  datasourceProtected = new MatTableDataSource<IGalleryEntry>([]);
  datasourceSelf = new MatTableDataSource<IGalleryEntry>([]);

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;
  @ViewChild('paginator', { static: true }) paginatorPrivate: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginatorPublic: MatPaginator;
  @ViewChild('paginator3', { static: true }) paginatorProtected: MatPaginator;
  @ViewChild('paginator4', { static: true }) paginatorSelf: MatPaginator;

  drawings: IGalleryEntry[] = [];
  drawingsEntry: IGalleryEntry[] = []

  teamName: String[];
  isLoaded = false;
  dataObsPublic: BehaviorSubject<IGalleryEntry[]>;
  dataObsPrivate: BehaviorSubject<IGalleryEntry[]>;
  dataObsProtected: BehaviorSubject<IGalleryEntry[]>;
  dataObsSelf: BehaviorSubject<IGalleryEntry[]>;

  handlerCallbacks: Record<GalleryEvents, (data: any) => any> = {
    Connect: (data: ICollaborationConnectResponse) => this.onConnect(data),
    Join: (data: ICollaborationJoinResponse) => this.onJoin(data),
    Load: (data: ICollaborationLoadResponse) => this.onLoad(data),
    Create: (data: ICollaborationCreateResponse) => this.onCreate(),
    Update: (data: ICollaborationUpdateResponse) => this.onUpdate(),
    Delete: (data: ICollaborationDeleteResponse) => this.onDelete(data),
    Leave: (data: ICollaborationLeaveResponse) => this.onLeave(data)
  }

  constructor(
    private snackbar: MatSnackBar,
    private openDrawingService: OpenDrawingService,
    public drawingService: DrawingService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private drawingGalleryService: DrawingGalleryService,
    private syncCollaboration: SyncCollaborationService,
    private socketService: SocketService,
    private auth: AuthService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
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
              this.syncCollaboration.onJoinCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Join }))),
              this.syncCollaboration.onConnectCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Connect }))),
              this.syncCollaboration.onCreateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Create }))),
              this.syncCollaboration.onDeleteCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Delete }))),
              this.syncCollaboration.onUpdateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Update }))),
              this.syncCollaboration.onLoadCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Load })))
            )
          } else {
            return of(EMPTY);
          }
        })
      ).subscribe((data: object & { eventType: GalleryEvents }) => {
        if (data && data.eventType) {
          this.handlerCallbacks[data.eventType](data);
        }
      })

    this.paginatorPrivate._intl.itemsPerPageLabel = "Dessins par page: ";
    this.paginatorPublic._intl.itemsPerPageLabel = "Dessins par page: ";
    this.paginatorProtected._intl.itemsPerPageLabel = "Dessins par page: ";
    this.paginatorSelf._intl.itemsPerPageLabel = "Dessins par page: ";
  }

  ngOnDestroy(): void {
    if (this.errorListener) { this.errorListener.unsubscribe(); }
    if (this.datasourcePublic) { this.datasourcePublic.disconnect(); }
    if (this.datasourcePrivate) { this.datasourcePrivate.disconnect(); }
    if (this.datasourceProtected) { this.datasourceProtected.disconnect(); }
    if (this.datasourceProtected) { this.datasourceSelf.disconnect(); }
    if (this.messageListener) { this.messageListener.unsubscribe(); }
    if (this.drawingsSubscription) {
      this.drawingsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.fetchAllDrawings();
    this.datasourcePublic.paginator = this.paginatorPublic;
    this.datasourcePrivate.paginator = this.paginatorPrivate;
    this.datasourceProtected.paginator = this.paginatorProtected;
    this.dataObsPublic = this.datasourcePublic.connect();
    this.dataObsPrivate = this.datasourcePrivate.connect();
    this.dataObsProtected = this.datasourceProtected.connect();
    this.dataObsSelf = this.datasourceSelf.connect();
    this.cdr.detectChanges();
  }

  public search() {

  }

  get tagCtrl(): FormControl {
    return this.openDrawingService.tagCtrl;
  }

  get errorOpenFile() {
    return this.openDrawingService.errorDialog;
  }
  get filteredTags(): Observable<string[]> {
    return this.openDrawingService.filteredTags;
  }
  get selectedTags(): string[] {
    return this.openDrawingService.selectedTags;
  }
  get allTags(): string[] {
    return this.openDrawingService.allTags;

  }
  get selectedDrawing(): Drawing | null {
    return this.openDrawingService.selectedDrawing;
  }

  isOneWeekOld(date: number) {
    return Math.round(new Date().getTime() - new Date(date).getTime()) > ONE_WEEK_NUMERIC_VALUE;
  }

  getLocalThumbnail() {
    const container: HTMLElement | null = document.getElementById('localFileThumbnail');
    if (container) {
      const svgThumbnail: Element | null = container.children.item(0);
      if (svgThumbnail) {
        this.renderer.setAttribute(svgThumbnail, 'viewBox', `0 0 800 800`);
        svgThumbnail.innerHTML = `${this.openDrawingService.localDrawingThumbnail}`;
      }
    }
  }

  setPagination(index: number): void {
    setTimeout(() => {
      switch (index) {
        case 0:
          !this.datasourcePublic.paginator ? this.datasourceSelf.paginator = this.paginatorSelf : null;
          break;
        case 1:
          !this.datasourcePublic.paginator ? this.datasourcePublic.paginator = this.paginatorPublic : null;
          break;
        case 2:
          !this.datasourcePrivate.paginator ? this.datasourcePrivate.paginator = this.paginatorPrivate : null;
          break;
        case 3:
          !this.datasourceProtected.paginator ? this.datasourceProtected.paginator = this.paginatorProtected : null;
      }
    });
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

  onConnect(data: ICollaborationConnectResponse) {
    console.log('Connected Event Triggered')
  }

  onJoin(data: ICollaborationJoinResponse) {
    this.snackbar.open('Vous faisez maintenant partie des collaborateurs de ce dessin. Vous pouvez y accédé à partir de l\'onglet \'Mes Dessins\'!', '', { duration: 5000 });
    this.fetchAllDrawings();
  }

  onLoad(data: ICollaborationLoadResponse) {
    if (this.dialogRef) this.dialogRef.close();
    this.drawingService.activeDrawingData = data;
    this.router.navigateByUrl('drawing');
  }

  onCreate() {
    if (this.dialogRef) this.dialogRef.close();
    this.snackbar.open('Nouveau dessin créé avec succès!', '', { duration: 5000 });
    this.fetchAllDrawings();
  }

  onUpdate() {
    if (this.dialogRef) this.dialogRef.close();
    this.snackbar.open('Dessin modifié avec succès!', '', { duration: 5000 });
    this.fetchAllDrawings();
  }

  onDelete(data: ICollaborationDeleteResponse) {
    if (this.dialogRef) this.dialogRef.close();
    this.snackbar.open('Dessin supprimé avec succès!', '', { duration: 5000 });
    this.fetchAllDrawings();
  }

  onLeave(data: ICollaborationLeaveResponse) {
    this.dialogRef.close();
    this.snackbar.open('Dessin quitté avec succès!', '', { duration: 5000 });
    this.fetchAllDrawings();
  }

  fetchAllDrawings(): void {
    this.drawingsSubscription = merge(
      this.drawingGalleryService.getPublicDrawings(),
      this.drawingGalleryService.getPrivateDrawings(),
      this.drawingGalleryService.getProtectedDrawings(),
      this.drawingGalleryService.getMyDrawings()
    ).subscribe((drawings: IGalleryEntry[]) => {
      if (drawings && drawings.length > 0) {
        const drawingType = drawings[0].type;
        if (drawingType === DrawingType.Protected) {
          this.datasourceProtected.data = drawings;
        } else if (drawingType === DrawingType.Private) {
          this.datasourcePrivate.data = drawings;
        } else {
          this.datasourcePublic.data = drawings;
        }
      }
    });
  }
}