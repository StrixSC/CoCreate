import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent,
  MatDialog, MatPaginator, MatTableDataSource
} from '@angular/material';
import { BehaviorSubject, EMPTY, merge, Observable, of, Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { OpenDrawingService } from 'src/app/services/open-drawing/open-drawing.service';
import { Drawing } from '../../../../../common/communication/drawing';
import { NewDrawingFormDialogComponent } from '../new-drawing-form-dialog/new-drawing-form-dialog.component';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { NewDrawingService } from 'src/app/services/new-drawing/new-drawing.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { SocketService } from 'src/app/services/chat/socket.service';
import { switchMap, take } from 'rxjs/operators';
import { now } from 'moment';
import { AngularFireAuth } from '@angular/fire/auth';

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

  private user: firebase.User;
  private afSubscription: Subscription;

  
  
  datasourcePublic = new MatTableDataSource<IGalleryEntry>();
  datasourcePrivate = new MatTableDataSource<IGalleryEntry>();
  datasourceProtected = new MatTableDataSource<IGalleryEntry>();


  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;
  @ViewChild('paginator', { static: true }) paginatorPrivate: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginatorPublic: MatPaginator;
  @ViewChild('paginator3', { static: true }) paginatorProtected: MatPaginator;

  drawings: IGalleryEntry[] = [];
  drawingsEntry: IGalleryEntry[] = []


  teamName: String[];
  isLoaded = false;
  dataObsPublic: BehaviorSubject<IGalleryEntry[]>;
  dataObsPrivate: BehaviorSubject<IGalleryEntry[]>;
  dataObsProtected: BehaviorSubject<IGalleryEntry[]>;

  constructor(
    private openDrawingService: OpenDrawingService,
    public drawingService: DrawingService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private drawingGalleryService: DrawingGalleryService,
    private syncCollaboration: SyncCollaborationService,
    private socketService: SocketService,
    private af: AngularFireAuth
  ) {
    
}

  ngOnInit(): void {

    this.afSubscription = this.af.authState.subscribe(user => {
      if(user !== null){
      this.user = user;
      console.log(user.uid);}
    });

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
              this.syncCollaboration.onJoinCollaboration(),
              this.syncCollaboration.onConnectCollaboration(),
              this.syncCollaboration.onCreateCollaboration(),
              this.syncCollaboration.onDeleteCollaboration(),
              this.syncCollaboration.onJoinCollaboration(),
              this.syncCollaboration.onUpdateCollaboration(),
              this.syncCollaboration.onLoadCollaboration()
            )
          } else {
            console.log("hey 2")
            return of(EMPTY);
          }
        })
      ).subscribe((data: any) => {
        console.log('Event received');
        console.log(data)
      })
      console.log("hey")


    this.drawingGalleryService.getPublicDrawings()
        .subscribe((drawings: IGalleryEntry[]) => {
          this.datasourcePublic.data = drawings
        });
    this.drawingGalleryService.getPrivateDrawings()
    .subscribe((drawings: IGalleryEntry[]) => {
      this.datasourcePrivate.data = drawings;
    });
    this.drawingGalleryService.getProtectedDrawings()
    .subscribe((drawings: IGalleryEntry[]) => {
      this.datasourceProtected.data = drawings;
    });
    this.paginatorPrivate._intl.itemsPerPageLabel="Dessins par page: ";
    this.paginatorPublic._intl.itemsPerPageLabel="Dessins par page: ";
    this.paginatorProtected._intl.itemsPerPageLabel="Dessins par page: ";
    
  }



  ngOnDestroy(): void {
    if (this.errorListener) { this.errorListener.unsubscribe();}
    if (this.datasourcePublic) { this.datasourcePublic.disconnect(); }
    if (this.datasourcePrivate) { this.datasourcePrivate.disconnect(); }
    if (this.datasourceProtected) { this.datasourceProtected.disconnect(); }
    if(this.messageListener) { this.messageListener.unsubscribe();}
    if(this.afSubscription) {
      this.afSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {

    this.datasourcePublic.paginator = this.paginatorPublic;
    this.datasourcePrivate.paginator = this.paginatorPrivate;
    this.datasourceProtected.paginator = this.paginatorProtected;
    this.dataObsPublic = this.datasourcePublic.connect();
    this.dataObsPrivate = this.datasourcePrivate.connect();
    this.dataObsProtected = this.datasourceProtected.connect();
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    this.listenCreateChannel();
  }


  public listenCreateChannel(){
  this.syncCollaboration
      .onCreateCollaboration()
      .subscribe((data: IGalleryEntry) => {
          this.drawings.push({
              userId: data.userId,
              drawing_id: data.drawing_id, title: data.title, type: data.type,owner: data.author_username, created_at: now().toString() , collaborator_count: data.collaborator_count, author_username: data.author_username, img:"../../../assets/img/mock-img/2.jpg"
            });
        });
        //this.router.navigateByUrl("/"+this.drawings.slice(-1)[0].drawing_id);
  }

  public search() {
    
  }


  /*listenToNewMessages() {
    this.chatSocketService.joinChannel(this.channel_id);
    this.chatSocketService
      .receiveMessage()
      .subscribe((data: IReceiveMessagePayload) => {

          this.messages.push({
            message: data.message,
            avatar: data.avatarUrl,
            username: data.username,
            time: data.createdAt,
          });
        
      });
  }*/


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

  sortPublicVisibility(drawings: IGalleryEntry[]) : IGalleryEntry[] {
    let sort: IGalleryEntry[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Public')
      {
        sort.push(drawing);
      }
    }
    return sort;
  }

  sortPrivateVisibility(drawings: IGalleryEntry[]) : IGalleryEntry[] {
    let sort: IGalleryEntry[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Private' /*&& drawing.author_username == this.user*/)
      {
        sort.push(drawing);
      }
    }
    return sort;
  }
  sortProtectedVisibility(drawings: IGalleryEntry[]) : IGalleryEntry[] {
    let sort: IGalleryEntry[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Protected')
      {
        sort.push(drawing);
      }
    }
    return sort;
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
  
  handleFile() {
    this.openDrawingService.handleFile(this.fileUploadEl.nativeElement.files);
  }

  tagsToStringList(tags: string[]): string {
    let result = '';
    for (const tag of tags) {
      result += `${tag}, `;
    }
    return result.substring(0, result.length - 2);
  }

  createDrawing(){    
    this.router.navigateByUrl("drawing");
  }

  setPagination(index : number) : void {
    setTimeout(() => {
      switch (index) {
        case 0:
        !this.datasourcePublic.paginator ? this.datasourcePublic.paginator = this.paginatorPublic : null;  
        break;
        case 1:
        !this.datasourcePrivate.paginator ? this.datasourcePrivate.paginator = this.paginatorPrivate : null;  
        break;
        case 2:
        !this.datasourceProtected.paginator ? this.datasourceProtected.paginator = this.paginatorProtected : null;
      }
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(NewDrawingComponent,
      {
        autoFocus: false,
        width: '90%', height: '90%',
        data: this.user.uid,
        
      });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
  
  exitToApp() : void {
    this.router.navigateByUrl("menu");
  }
}