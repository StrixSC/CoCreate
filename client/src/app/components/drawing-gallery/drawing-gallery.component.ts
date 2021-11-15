import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Drawing1 } from '../../../../../common/communication//new-drawing-parameters';
import {
  MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent,
  MatDialog, MatPaginator, MatTableDataSource
} from '@angular/material';
import { BehaviorSubject, Observable } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { OpenDrawingService } from 'src/app/services/open-drawing/open-drawing.service';
import { Drawing } from '../../../../../common/communication/drawing';
import { NewDrawingFormDialogComponent } from '../new-drawing-form-dialog/new-drawing-form-dialog.component';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';

const ONE_WEEK_NUMERIC_VALUE = 24 * 60 * 60 * 1000 * 7;

const DATA: Drawing1[] = [
  {drawing_id: "1", title: 'Hydrogen', type: 'Public', owner: 'Pati', created_at: "2019-01-16" , collaboration_count: 2, author_username: 'Flower', img:"../../../assets/img/mock-img/1.jpg"},
  {drawing_id: "2", title: 'Helium', type: 'Protégé',owner: 'Pati', created_at: "2020-01-16" , collaboration_count: 0, author_username: 'Pati', img:"../../../assets/img/mock-img/2.jpg"},
  {drawing_id: "3", title: 'Lithium', type: 'Privé',owner: 'Daisy', created_at: "2021-01-16" , collaboration_count: 1, author_username: 'Daisy', img:"../../../assets/img/mock-img/3.jpg"},
  {drawing_id: "4",title: 'Beryllium', type: 'Public',owner: 'Tulipe', created_at: "2021-09-23" , collaboration_count: 0, author_username: 'Power', img:"../../../assets/img/mock-img/4.jpg"},
  {drawing_id: "5",title: 'Boron', type: 'Protégé',owner: 'Mari', created_at: "2021-09-16" , collaboration_count: 0, author_username: 'Mari', img:"../../../assets/img/mock-img/5.jpg"},
  {drawing_id: "6",title: 'Carbon', type: 'Privé',owner: 'Cherry', created_at: "2018-03-04" , collaboration_count: 1, author_username: 'Cherry', img:"../../../assets/img/mock-img/6.jpg"},
  {drawing_id: "7",title: 'Nitrogen', type: 'Public',owner: 'Blossom', created_at: "2020-12-02" , collaboration_count: 1, author_username: 'Blossom', img:"../../../assets/img/mock-img/7.jpg"},
  {drawing_id: "8",title: 'Oxygen', type: 'Protégé',owner: 'Berry', created_at: "2021-04-03" , collaboration_count: 4, author_username: 'Berry', img:"../../../assets/img/mock-img/8.jpg"},
  {drawing_id: "9",title: 'Fluorine', type: 'Public',owner: 'Mari', created_at: "2021-08-30" , collaboration_count: 5, author_username: 'Mari', img:"../../../assets/img/mock-img/9.jpg"},
  {drawing_id: "10",title: 'Neon', type: 'Privé',owner: 'Pati', created_at: "2021-03-21" , collaboration_count: 3, author_username: 'Pati', img:"../../../assets/img/mock-img/10.jpg"},
  {drawing_id: "11",title: 'Sodium', type: 'Protégé',owner: 'Daisy', created_at: "2021-02-14" , collaboration_count: 2, author_username: 'Daisy', img:"../../../assets/img/mock-img/11.jpg"},
  {drawing_id: "12",title: 'Magnesium', type: 'Public',owner: 'Daisy', created_at: "2020-12-25" , collaboration_count: 2, author_username: 'Daisy', img:"../../../assets/img/mock-img/12.jpg"},
  {drawing_id: "13",title: 'Aluminum', type: 'Privé',owner: 'Tulipe', created_at: "2021-01-01" , collaboration_count: 1, author_username: 'Tulipe', img:"../../../assets/img/mock-img/13.jpg"},
  {drawing_id: "14",title: 'Silicon', type: 'Protégé',owner: 'Heroku', created_at: "2021-08-05" , collaboration_count: 0, author_username: 'Heroku', img:"../../../assets/img/mock-img/14.jpg"},
  {drawing_id: "15",title: 'Phosphorus', type: 'Public',owner: 'Stella', created_at: "2021-07-31" , collaboration_count: 0, author_username: 'Stella', img:"../../../assets/img/mock-img/15.jpg"},
  {drawing_id: "16",title: 'Sulfur',type: 'Privé',owner: 'Pepsi_Hero', created_at: "2021-05-19" , collaboration_count: 0, author_username: 'Pepsi_Hero', img:"../../../assets/img/mock-img/16.jpg"},
  {drawing_id: "17",title: 'Chlorine', type: 'Protégé',owner: 'Louis XIV', created_at: "2021-10-31" , collaboration_count: 0, author_username: 'Louis XIV', img:"../../../assets/img/mock-img/17.jpg"},
  {drawing_id: "18",title: 'Argon', type: 'Public',owner: 'Pati', created_at: "2019-01-08" , collaboration_count: 2, author_username: 'Pati', img:"../../../assets/img/mock-img/18.jpg"},
  {drawing_id: "19",title: 'Potassium', type: 'Protégé',owner: 'Pati', created_at: "2020-03-29" , collaboration_count: 1, author_username: 'Pati', img:"../../../assets/img/mock-img/19.jpg"},
  {drawing_id: "20",title: 'Calcium',type: 'Privé',owner: 'Peach', created_at: "2021-06-24" , collaboration_count: 1, author_username: 'Peach', img:"../../../assets/img/mock-img/20.jpg"},
];

@Component({
  selector: 'app-drawing-gallery',
  templateUrl: './drawing-gallery.component.html',
  styleUrls: ['./drawing-gallery.component.scss']
})

export class DrawingGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  user: string= "Pati";
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  pageIndex = 0;
  selectedTab = new FormControl(0);
  
  
  datasourcePublic = new MatTableDataSource<Drawing1>(this.sortPublicVisibility(DATA));
  datasourcePrivate = new MatTableDataSource<Drawing1>(this.sortPrivateVisibility(DATA));
  datasourceProtected = new MatTableDataSource<Drawing1>(this.sortProtectedVisibility(DATA));


  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;
  @ViewChild('paginator', { static: true }) paginatorPrivate: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginatorPublic: MatPaginator;
  @ViewChild('paginator3', { static: true }) paginatorProtected: MatPaginator;

  drawings: Drawing1[] = [];


  teamName: String[];
  isLoaded = false;
  dataObsPublic: BehaviorSubject<Drawing1[]>;
  dataObsPrivate: BehaviorSubject<Drawing1[]>;
  dataObsProtected: BehaviorSubject<Drawing1[]>;

  constructor(
    private openDrawingService: OpenDrawingService,
    public drawingService: DrawingService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private drawingGalleryService: DrawingGalleryService
  ) {
    this.drawingGalleryService.getDrawings()
        .subscribe((drawings: Drawing1[]) => {
          this.datasourcePrivate.data = drawings;
        });
}

  ngOnInit(): void {
    this.paginatorPrivate._intl.itemsPerPageLabel="Dessins par page: ";
    this.paginatorPublic._intl.itemsPerPageLabel="Dessins par page: ";
    this.paginatorProtected._intl.itemsPerPageLabel="Dessins par page: ";
    
  }

  ngOnDestroy(): void {
    if (this.datasourcePublic) { this.datasourcePublic.disconnect(); }
    if (this.datasourcePrivate) { this.datasourcePrivate.disconnect(); }
    if (this.datasourceProtected) { this.datasourceProtected.disconnect(); }
  }

  ngAfterViewInit(): void {

    this.datasourcePublic.paginator = this.paginatorPublic;
    this.datasourcePrivate.paginator = this.paginatorPrivate;
    this.datasourceProtected.paginator = this.paginatorProtected;
    // this.numPrivatePages = this.drawings.length;
    // this.numPublicPages = this.drawings.length;
    this.dataObsPublic = this.datasourcePublic.connect();
    this.dataObsPrivate = this.datasourcePrivate.connect();
    this.dataObsProtected = this.datasourceProtected.connect();
    this.cdr.detectChanges();
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

  sortPublicVisibility(drawings: Drawing1[]) : Drawing1[] {
    let sort: Drawing1[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Public')
      {
        sort.push(drawing);
      }
    }
    return sort;
  }

  sortPrivateVisibility(drawings: Drawing1[]) : Drawing1[] {
    let sort: Drawing1[] = new Array();
    for (let drawing of drawings){
      if(drawing.type ==='Privé' && drawing.author_username == this.user)
      {
        sort.push(drawing);
      }
    }
    return sort;
  }
  sortProtectedVisibility(drawings: Drawing1[]) : Drawing1[] {
    let sort: Drawing1[] = new Array();
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

 /*async deleteDrawing(event: MouseEvent, drawing: Drawing): Promise<void> {
    event.stopPropagation();
    if (await this.openDrawingService.deleteDrawing(drawing)) {
      const index = this.dataSource.data.indexOf(drawing, 0);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.drawingPreview = this.dataSource.data;
        this.dataObs.next(this.dataSource.data);
      }
    }
  }*/

  // getBackgroundSelected(drawing: Drawing): string {
  //   return this.openDrawingService.getBackgroundSelected(drawing);
  // }

  // selectDrawing(drawing: Drawing) {
  //   this.openDrawingService.selectDrawing(drawing);
  // }

  // ouvre un nouveau dessin  avec l'ancien drawing
  // accept(): void {
  //   this.openDrawingService.accept(this.dialogRef, this.selectedTab.value);
  // }

  // close(): void {
  //   this.openDrawingService.reset();
  //   this.dialogRef.close();
  // }

  /*add(event: MatChipInputEvent): void {
    this.openDrawingService.add(event, this.matAutocomplete.isOpen);
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
  }

  remove(tag: string): void {
    this.openDrawingService.remove(tag);
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
  }*/
  // Selecting a tag from suggestion
  /*selected(event: MatAutocompleteSelectedEvent): void {
    this.openDrawingService.selectTag(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
  }*/
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
    const dialogRef = this.dialog.open(NewDrawingFormDialogComponent,
      {
        autoFocus: false,
        width: '70%', height: '80%',
        
      });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
  
  exitToApp() : void {
    this.router.navigateByUrl("menu");
  }
}