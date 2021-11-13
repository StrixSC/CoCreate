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
import { TagService } from 'src/app/services/tag/tag.service';
import { Drawing } from '../../../../../common/communication/drawing';

const ONE_WEEK_NUMERIC_VALUE = 24 * 60 * 60 * 1000 * 7;

const DATA: Drawing1[] = [
  {id: "1", name: 'Hydrogen', visibility: 'Public', owner: 'Pati', creationDate: new Date("2019-01-16"), numActifCollaborators: 2, author: 'Flower', img:"../../../assets/img/mock-img/1.jpg"},
  {id: "2", name: 'Helium', visibility: 'Protégé',owner: 'Pati', creationDate: new Date("2020-01-16"), numActifCollaborators: 0, author: 'Pati', img:"../../../assets/img/mock-img/2.jpg"},
  {id: "3", name: 'Lithium', visibility: 'Privé',owner: 'Daisy', creationDate: new Date("2021-01-16"), numActifCollaborators: 1, author: 'Daisy', img:"../../../assets/img/mock-img/3.jpg"},
  {id: "4",name: 'Beryllium', visibility: 'Public',owner: 'Tulipe', creationDate: new Date("2021-09-23"), numActifCollaborators: 0, author: 'Power', img:"../../../assets/img/mock-img/4.jpg"},
  {id: "5",name: 'Boron', visibility: 'Protégé',owner: 'Mari', creationDate: new Date("2021-09-16"), numActifCollaborators: 0, author: 'Mari', img:"../../../assets/img/mock-img/5.jpg"},
  {id: "6",name: 'Carbon', visibility: 'Privé',owner: 'Cherry', creationDate: new Date("2018-03-04"), numActifCollaborators: 1, author: 'Cherry', img:"../../../assets/img/mock-img/6.jpg"},
  {id: "7",name: 'Nitrogen', visibility: 'Public',owner: 'Blossom', creationDate: new Date("2020-12-02"), numActifCollaborators: 1, author: 'Blossom', img:"../../../assets/img/mock-img/7.jpg"},
  {id: "8",name: 'Oxygen', visibility: 'Protégé',owner: 'Berry', creationDate: new Date("2021-04-03"), numActifCollaborators: 4, author: 'Berry', img:"../../../assets/img/mock-img/8.jpg"},
  {id: "9",name: 'Fluorine', visibility: 'Public',owner: 'Mari', creationDate: new Date("2021-08-30"), numActifCollaborators: 5, author: 'Mari', img:"../../../assets/img/mock-img/9.jpg"},
  {id: "10",name: 'Neon', visibility: 'Privé',owner: 'Pati', creationDate: new Date("2021-03-21"), numActifCollaborators: 3, author: 'Pati', img:"../../../assets/img/mock-img/10.jpg"},
  {id: "11",name: 'Sodium', visibility: 'Protégé',owner: 'Daisy', creationDate: new Date("2021-02-14"), numActifCollaborators: 2, author: 'Daisy', img:"../../../assets/img/mock-img/11.jpg"},
  {id: "12",name: 'Magnesium', visibility: 'Public',owner: 'Daisy', creationDate: new Date("2020-12-25"), numActifCollaborators: 2, author: 'Daisy', img:"../../../assets/img/mock-img/12.jpg"},
  {id: "13",name: 'Aluminum', visibility: 'Privé',owner: 'Tulipe', creationDate: new Date("2021-01-01"), numActifCollaborators: 1, author: 'Tulipe', img:"../../../assets/img/mock-img/13.jpg"},
  {id: "14",name: 'Silicon', visibility: 'Protégé',owner: 'Heroku', creationDate: new Date("2021-08-05"), numActifCollaborators: 0, author: 'Heroku', img:"../../../assets/img/mock-img/14.jpg"},
  {id: "15",name: 'Phosphorus', visibility: 'Public',owner: 'Stella', creationDate: new Date("2021-07-31"), numActifCollaborators: 0, author: 'Stella', img:"../../../assets/img/mock-img/15.jpg"},
  {id: "16",name: 'Sulfur',visibility: 'Privé',owner: 'Pepsi_Hero', creationDate: new Date("2021-05-19"), numActifCollaborators: 0, author: 'Pepsi_Hero', img:"../../../assets/img/mock-img/16.jpg"},
  {id: "17",name: 'Chlorine', visibility: 'Protégé',owner: 'Louis XIV', creationDate: new Date("2021-10-31"), numActifCollaborators: 0, author: 'Louis XIV', img:"../../../assets/img/mock-img/17.jpg"},
  {id: "18",name: 'Argon', visibility: 'Public',owner: 'Pati', creationDate: new Date("2019-01-08"), numActifCollaborators: 2, author: 'Pati', img:"../../../assets/img/mock-img/18.jpg"},
  {id: "19",name: 'Potassium', visibility: 'Protégé',owner: 'Pati', creationDate: new Date("2020-03-29"), numActifCollaborators: 1, author: 'Pati', img:"../../../assets/img/mock-img/19.jpg"},
  {id: "20",name: 'Calcium',visibility: 'Privé',owner: 'Peach', creationDate: new Date("2021-06-24"), numActifCollaborators: 1, author: 'Peach', img:"../../../assets/img/mock-img/20.jpg"},
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
  
  
  dataSource = new MatTableDataSource<Drawing1>(this.sortPublicVisibility(DATA));
  dataSource2 = new MatTableDataSource<Drawing1>(this.sortPrivateVisibility(DATA));
  dataSource3 = new MatTableDataSource<Drawing1>(this.sortProtectedVisibility(DATA));


  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;
  @ViewChild('paginator', { static: true }) paginatorPrivate: MatPaginator;
  @ViewChild('paginator2', { static: true }) paginatorPublic: MatPaginator;
  @ViewChild('paginator3', { static: true }) paginatorProtected: MatPaginator;

  drawings: Drawing1[] = [];


  teamName: String[];
  isLoaded = false;
  // numPublicPages = 0;
  // numPrivatePages = 0;
  // numProtectedPages = 0

  //dataSource: MatTableDataSource<Drawing> = new MatTableDataSource<Drawing>();
  dataObsPublic: BehaviorSubject<Drawing1[]>;
  dataObsPrivate: BehaviorSubject<Drawing1[]>;
  dataObsProtected: BehaviorSubject<Drawing1[]>;

  constructor(
    private openDrawingService: OpenDrawingService,
    public drawingService: DrawingService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private tagService: TagService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    

  }

  ngOnInit(): void {
    //this.dataSource.filterPredicate = ((data: NewDrawingParameters) => this.tagService.containsTag(data, this.selectedTags));

    //this.paginator._intl.itemsPerPageLabel="Dessins par page: ";
  }

  ngOnDestroy(): void {
    if (this.dataSource) { this.dataSource.disconnect(); }
  }

  ngAfterViewInit(): void {
    //this.dataSource.paginator = this.paginator;
    
    this.drawings = this.dataSource.connect().value;
    this.drawings = this.dataSource2.connect().value;
    this.dataSource.paginator = this.paginatorPublic;
    this.dataSource2.paginator = this.paginatorPrivate;
    this.dataSource3.paginator = this.paginatorProtected;
    // this.numPrivatePages = this.drawings.length;
    // this.numPublicPages = this.drawings.length;
    this.dataObsPublic = this.dataSource.connect();
    this.dataObsPrivate = this.dataSource2.connect();
    this.dataObsProtected = this.dataSource3.connect();
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
      if(drawing.visibility ==='Public')
      {
        sort.push(drawing);
      }
    }
    return sort;
  }

  sortPrivateVisibility(drawings: Drawing1[]) : Drawing1[] {
    let sort: Drawing1[] = new Array();
    for (let drawing of drawings){
      if(drawing.visibility ==='Privé' && drawing.author == this.user)
      {
        sort.push(drawing);
      }
    }
    return sort;
  }
  sortProtectedVisibility(drawings: Drawing1[]) : Drawing1[] {
    let sort: Drawing1[] = new Array();
    for (let drawing of drawings){
      if(drawing.visibility ==='Protégé')
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

  add(event: MatChipInputEvent): void {
    this.openDrawingService.add(event, this.matAutocomplete.isOpen);
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
  }

  remove(tag: string): void {
    this.openDrawingService.remove(tag);
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
  }
  // Selecting a tag from suggestion
  selected(event: MatAutocompleteSelectedEvent): void {
    this.openDrawingService.selectTag(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.dataSource.filter = this.openDrawingService.selectedTags.toString();
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
        !this.dataSource.paginator ? this.dataSource.paginator = this.paginatorPublic : null;  
        break;
        case 1:
        !this.dataSource2.paginator ? this.dataSource2.paginator = this.paginatorPrivate : null;  
        break;
        case 2:
        !this.dataSource3.paginator ? this.dataSource3.paginator = this.paginatorProtected : null;
      }
    });
  }
  
  exitToApp() : void {
    this.router.navigateByUrl("menu");
  }
}