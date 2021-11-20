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

const DATA: IGalleryEntry[] = [
  /*{drawing_id: "1", title: 'Hydrogen', type: 'Public', owner: 'Pati', created_at: "2019-01-16" , collaborator_count: 2, author_username: 'Flower', img:"../../../assets/img/mock-img/1.jpg"},
  {drawing_id: "2", title: 'Helium', type: 'Protégé',owner: 'Pati', created_at: "2020-01-16" , collaborator_count: 0, author_username: 'Pati', img:"../../../assets/img/mock-img/2.jpg"},
  {drawing_id: "3", title: 'Lithium', type: 'Privé',owner: 'Daisy', created_at: "2021-01-16" , collaborator_count: 1, author_username: 'Daisy', img:"../../../assets/img/mock-img/3.jpg"},
  {drawing_id: "4",title: 'Beryllium', type: 'Public',owner: 'Tulipe', created_at: "2021-09-23" , collaborator_count: 0, author_username: 'Power', img:"../../../assets/img/mock-img/4.jpg"},
  {drawing_id: "5",title: 'Boron', type: 'Protégé',owner: 'Mari', created_at: "2021-09-16" , collaborator_count: 0, author_username: 'Mari', img:"../../../assets/img/mock-img/5.jpg"},
  {drawing_id: "6",title: 'Carbon', type: 'Privé',owner: 'Cherry', created_at: "2018-03-04" , collaborator_count: 1, author_username: 'Cherry', img:"../../../assets/img/mock-img/6.jpg"},
  {drawing_id: "7",title: 'Nitrogen', type: 'Public',owner: 'Blossom', created_at: "2020-12-02" , collaborator_count: 1, author_username: 'Blossom', img:"../../../assets/img/mock-img/7.jpg"},
  {drawing_id: "8",title: 'Oxygen', type: 'Protégé',owner: 'Berry', created_at: "2021-04-03" , collaborator_count: 4, author_username: 'Berry', img:"../../../assets/img/mock-img/8.jpg"},
  {drawing_id: "9",title: 'Fluorine', type: 'Public',owner: 'Mari', created_at: "2021-08-30" , collaborator_count: 5, author_username: 'Mari', img:"../../../assets/img/mock-img/9.jpg"},
  {drawing_id: "10",title: 'Neon', type: 'Privé',owner: 'Pati', created_at: "2021-03-21" , collaborator_count: 3, author_username: 'Pati', img:"../../../assets/img/mock-img/10.jpg"},
  {drawing_id: "11",title: 'Sodium', type: 'Protégé',owner: 'Daisy', created_at: "2021-02-14" , collaborator_count: 2, author_username: 'Daisy', img:"../../../assets/img/mock-img/11.jpg"},
  {drawing_id: "12",title: 'Magnesium', type: 'Public',owner: 'Daisy', created_at: "2020-12-25" , collaborator_count: 2, author_username: 'Daisy', img:"../../../assets/img/mock-img/12.jpg"},
  {drawing_id: "13",title: 'Aluminum', type: 'Privé',owner: 'Tulipe', created_at: "2021-01-01" , collaborator_count: 1, author_username: 'Tulipe', img:"../../../assets/img/mock-img/13.jpg"},
  {drawing_id: "14",title: 'Silicon', type: 'Protégé',owner: 'Heroku', created_at: "2021-08-05" , collaborator_count: 0, author_username: 'Heroku', img:"../../../assets/img/mock-img/14.jpg"},
  {drawing_id: "15",title: 'Phosphorus', type: 'Public',owner: 'Stella', created_at: "2021-07-31" , collaborator_count: 0, author_username: 'Stella', img:"../../../assets/img/mock-img/15.jpg"},
  {drawing_id: "16",title: 'Sulfur',type: 'Privé',owner: 'Pepsi_Hero', created_at: "2021-05-19" , collaborator_count: 0, author_username: 'Pepsi_Hero', img:"../../../assets/img/mock-img/16.jpg"},
  {drawing_id: "17",title: 'Chlorine', type: 'Protégé',owner: 'Louis XIV', created_at: "2021-10-31" , collaborator_count: 0, author_username: 'Louis XIV', img:"../../../assets/img/mock-img/17.jpg"},
  {drawing_id: "18",title: 'Argon', type: 'Public',owner: 'Pati', created_at: "2019-01-08" , collaborator_count: 2, author_username: 'Pati', img:"../../../assets/img/mock-img/18.jpg"},
  {drawing_id: "19",title: 'Potassium', type: 'Protégé',owner: 'Pati', created_at: "2020-03-29" , collaborator_count: 1, author_username: 'Pati', img:"../../../assets/img/mock-img/19.jpg"},
  {drawing_id: "20",title: 'Calcium',type: 'Privé',owner: 'Peach', created_at: "2021-06-24" , collaborator_count: 1, author_username: 'Peach', img:"../../../assets/img/mock-img/20.jpg"},*/
];

@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})

export class DrawingGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  //user: string= "Pati";
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

  
  
  datasourcePublic = new MatTableDataSource<IGalleryEntry>(this.sortPublicVisibility(DATA));
  datasourcePrivate = new MatTableDataSource<IGalleryEntry>(this.sortPrivateVisibility(DATA));
  datasourceProtected = new MatTableDataSource<IGalleryEntry>(this.sortProtectedVisibility(DATA));


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
    private newDrawingService: NewDrawingService,
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


    this.drawingGalleryService.getDrawings()
        .subscribe((drawings: IGalleryEntry[]) => {
          this.datasourcePublic.data = drawings;
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
    this.sendCreateChannel();
  }


  public sendCreateChannel(){
  this.newDrawingService.sendNewDrawingForm(this.user.uid);
  //this.syncCollaboration.sendCreateCollaboration(this.user.uid, 'firstdrawing', 'Public');
  this.syncCollaboration
      .onCreateCollaboration()
      .subscribe((data: IGalleryEntry) => {
          this.drawings.push({
              userId: data.userId,
              drawing_id: data.drawing_id, title: data.title, type: data.type,owner: data.author_username, created_at: now().toString() , collaborator_count: data.collaborator_count, author_username: data.author_username, img:"../../../assets/img/mock-img/2.jpg"
            });
        });
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
      if(drawing.type ==='Privé' /*&& drawing.author_username == this.user*/)
      {
        sort.push(drawing);
      }
    }
    return sort;
  }
  sortProtectedVisibility(drawings: IGalleryEntry[]) : IGalleryEntry[] {
    let sort: IGalleryEntry[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Protégé')
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
        
      });

    dialogRef.afterClosed().subscribe(() => {
      this.sendCreateChannel();
      console.log('The dialog was closed');
    });
  }
  
  exitToApp() : void {
    this.router.navigateByUrl("menu");
  }
}