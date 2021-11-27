import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NewDrawingFormDialogComponent } from './../new-drawing-form-dialog/new-drawing-form-dialog.component';
import { ICollaborationConnectResponse, ICollaborationDeleteResponse, ICollaborationJoinResponse, ICollaborationLeaveResponse, ICollaborationUpdateResponse, ICollaborationCreateResponse, ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { AuthService } from './../../services/auth.service';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatAutocomplete,
  MatDialog, MatPaginator, MatTableDataSource, PageEvent
} from '@angular/material';
import { BehaviorSubject, EMPTY, merge, of, Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { SocketService } from 'src/app/services/chat/socket.service';
import { switchMap, take, map } from 'rxjs/operators';

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

@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})

export class DrawingGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  errorListener: Subscription;
  messageListener: Subscription;
  dialogRef: MatDialogRef<NewDrawingFormDialogComponent>;
  datasourceSelf = new MatTableDataSource<IGalleryEntry>([]);
  datasourceAll = new MatTableDataSource<IGalleryEntry>([]);
  showFirstLastButtons = true;
  length: number;
  pageSize = 12;
  pageIndex = 0;
  lengthAll: number;
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
    public drawingService: DrawingService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private drawingGalleryService: DrawingGalleryService,
    private syncCollaboration: SyncCollaborationService,
    private socketService: SocketService,
    private auth: AuthService,
    private router: Router
  ) {}

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

  searchMyDrawings(value: any) {
    this.selectedOption = value;
  }

  searchAllDrawings(value: any) {
    this.selectedAllOption = value;
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
      this.pageSize = 12;
      this.pageIndex = 0;
    }
    else {
      this.pageSize = event.pageSize;
      this.pageIndex = event.pageIndex;
    }
    this.drawingsSubscription = merge(
      this.drawingGalleryService.getTypeMyDrawings( event.pageSize * event.pageIndex, this.selectedOption, this.myDrawingFilter).pipe(map((d: any) => ({ drawings: d.drawings, count: d.total_drawing_count})))
     ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string, count: number }) => {
      this.datasourceSelf.data = d.drawings;
      this.length = d.count;
    });
  }

  handleAllPageEvent(event: PageEvent, paginate: boolean) {

    if(!paginate)
    {
      this.pageSizeAll = 12;
      this.pageIndexAll = 0;
    }
    else {
      this.lengthAll = event.length
      this.pageSizeAll = event.pageSize;
      this.pageIndexAll = event.pageIndex;
    }

    this.drawingsSubscription = merge(
      this.drawingGalleryService.getTypeDrawings( event.pageSize * event.pageIndex, this.selectedAllOption, this.allDrawingFilter).pipe(map((d: any) => ({ drawings: d.drawings, count: d.total_drawing_count})))
     ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string, count: number }) => {

          this.datasourceAll.data = d.drawings;
          this.lengthAll = d.count;
  
  });}
  
  fetchAllDrawings(): void {
    this.drawingsSubscription = merge(
      this.drawingGalleryService.getDrawings().pipe(map((d: any) => ({ drawings: d.drawings, count: d.total_drawing_count}))),
      this.drawingGalleryService.getMyDrawings().pipe(map((d: any) => ({ drawings: d.drawings, galleryType: 'Self', count: d.total_drawing_count})))
    ).subscribe((d: { drawings: IGalleryEntry[], galleryType: string, count: number }) => {
      if (d.drawings && d.drawings.length > 0) {
        if (d.galleryType === 'Self') {
          this.datasourceSelf.data = d.drawings;
          this.length = d.count;
        } else {
          this.datasourceAll.data = d.drawings;
          this.lengthAll = d.count;
        }
      }
    });
  }
  
}