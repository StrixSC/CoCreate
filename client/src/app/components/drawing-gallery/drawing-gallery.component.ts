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
  MatDialog, MatPaginator, MatTableDataSource, PageEvent
} from '@angular/material';
import { BehaviorSubject, EMPTY, merge, Observable, of, Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { OpenDrawingService } from 'src/app/services/open-drawing/open-drawing.service';
import { Drawing } from '../../../../../common/communication/drawing';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { ICreateCollaboration, IGalleryEntry } from '../../model/IGalleryEntry.model';
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
  selectedTab = new FormControl(0);
  errorListener: Subscription;
  messageListener: Subscription;
  dialogRef: MatDialogRef<NewDrawingFormDialogComponent>;
  datasourceSelf = new MatTableDataSource<IGalleryEntry>([]);
  datasourceAll = new MatTableDataSource<IGalleryEntry>([]);
  showFirstLastButtons = true;
  length = 100;
  pageSize = 12;
  pageIndex = 0;
  lengthAll = 100;
  pageSizeAll = 12;
  pageIndexAll = 0;
  teamName: String[];
  isLoaded = false;
  dataObsSelf: BehaviorSubject<IGalleryEntry[]>;
  dataObsAll: BehaviorSubject<IGalleryEntry[]>;

  
  selectedOption: string = 'All';
  selectedAllOption: string = 'All';
  allDrawingFilter: string = '';
  myDrawingFilter: string = '';


  private drawingsSubscription: Subscription;

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  drawings: IGalleryEntry[] = [];
  drawingsEntry: IGalleryEntry[] = []
  
  public visibilityFilter: { key: string, value: string }[] =
    [
      {
        key: 'All',
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
        key: 'All',
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

    this.messageListener = merge(
              this.syncCollaboration.onJoinCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Join }))),
              this.syncCollaboration.onConnectCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Connect }))),
              this.syncCollaboration.onCreateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Create }))),
              this.syncCollaboration.onDeleteCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Delete }))),
              this.syncCollaboration.onUpdateCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Update }))),
              this.syncCollaboration.onLoadCollaboration().pipe(map((d) => ({ ...d, eventType: GalleryEvents.Load })))
            
         
      ).subscribe((data: object & { eventType: GalleryEvents }) => {
        if (data && data.eventType) {
          this.handlerCallbacks[data.eventType](data);
        }
      })

    this.initializePagination();

  }

  ngOnDestroy(): void {
    if (this.errorListener) { this.errorListener.unsubscribe(); }
    if (this.datasourceSelf) { this.datasourceSelf.disconnect(); }
    if (this.datasourceAll) { this.datasourceAll.disconnect(); }
    if (this.messageListener) { this.messageListener.unsubscribe(); }
    if (this.drawingsSubscription) {
      this.drawingsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.fetchAllDrawings();
    this.dataObsSelf = this.datasourceSelf.connect();
    this.dataObsAll = this.datasourceAll.connect();
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    this.listenCreateChannel();

  }

  public searchMyDrawings(value: any) {
    this.selectedOption = value
    console.log(this.selectedOption)
  }
  public searchAllDrawings(value: any) {
    this.selectedAllOption = value
    console.log(this.selectedAllOption)
  }

  setFilterMyDrawings(value: any) : void {
    this.myDrawingFilter = value;
  }

  setFilterAll(value: any) : void {
    this.allDrawingFilter = value;
  }

  initializePagination() : void {
    this.paginator._intl.itemsPerPageLabel = "Dessins par page: ";
    this.paginator._intl.nextPageLabel = "Page suivante";
    this.paginator._intl.lastPageLabel = "Dernière page";
    this.paginator._intl.previousPageLabel = "Page précédente"
    this.paginator._intl.firstPageLabel = "Première page"
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
    this.router.navigateByUrl('drawing');
  }

  onCreate() {
    this.dialogRef.close();
    this.snackbar.open('Nouveau dessin créé avec succès!', '', { duration: 5000 });
    this.syncCollaboration.onCreateCollaboration();
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

  handlePageEvent(event: PageEvent, paginate: boolean) {
    if(!paginate)
    {
      this.length = 100;
      this.pageSize = 12;
      this.pageIndex = 0;
    }
    else {
      this.length = event.length
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
    }
    this.drawingsSubscription = merge(
      this.drawingGalleryService.getTypeMyDrawings( event.pageSize * event.pageIndex, this.selectedOption, this.myDrawingFilter).pipe(map((d: any) => ({ drawings: d.drawings})))
     ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string }) => {
      this.datasourceSelf.data = d.drawings;
    });
  }

  handleAllPageEvent(event: PageEvent, paginate: boolean) {

    if(!paginate)
    {
      this.lengthAll = 100;
      this.pageSizeAll = 12;
      this.pageIndexAll = 0;
    }
    else {
      this.lengthAll = event.length
      this.pageSizeAll = event.pageSize;
      this.pageIndexAll = event.pageIndex;
    }

    this.drawingsSubscription = merge(
      this.drawingGalleryService.getTypeDrawings( event.pageSize * event.pageIndex, this.selectedAllOption).pipe(map((d: any) => ({ drawings: d.drawings})))
     ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string }) => {
      if (d.drawings && d.drawings.length > 0) {
        {
          this.datasourceAll.data = d.drawings;
        }
      }
  });}
  
  fetchAllDrawings(): void {
    this.drawingsSubscription = merge(
      this.drawingGalleryService.getDrawings().pipe(map((d: any) => ({ drawings: d.drawings}))),
      this.drawingGalleryService.getMyDrawings().pipe(map((d: any) => ({ drawings: d.drawings, galleryType: 'Self' })))
    ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string }) => {
      if (d.drawings && d.drawings.length > 0) {
        if (d.galleryType === 'Self') {
          this.datasourceSelf.data = d.drawings;
        } else {
          this.datasourceAll.data = d.drawings;
        }
      }
    });
  }

  public listenCreateChannel(){
    this.syncCollaboration
        .onCreateCollaboration()
        .subscribe((data: ICreateCollaboration) => {
           console.log(data)
          });
  }
  
}