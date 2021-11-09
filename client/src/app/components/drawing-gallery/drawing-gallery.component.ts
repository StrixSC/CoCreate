import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
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

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('fileUpload', { static: false }) fileUploadEl: ElementRef;
  

  drawingPreview: Drawing[] = [];
  isLoaded = false;
  numPages = 1;

  dataSource: MatTableDataSource<Drawing> = new MatTableDataSource<Drawing>();
  dataObs: BehaviorSubject<Drawing[]>;

  constructor(
    private openDrawingService: OpenDrawingService,
    public drawingService: DrawingService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private tagService: TagService,
    private router: Router,
  ) {
    this.dataSource = new MatTableDataSource<Drawing>();

  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = ((data: Drawing) => this.tagService.containsTag(data, this.selectedTags));
    this.dataObs = this.dataSource.connect();
    this.paginator._intl.itemsPerPageLabel="Dessins par page: ";
  }

  ngOnDestroy(): void {
    if (this.dataSource) { this.dataSource.disconnect(); }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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

  async deleteDrawing(event: MouseEvent, drawing: Drawing): Promise<void> {
    event.stopPropagation();
    if (await this.openDrawingService.deleteDrawing(drawing)) {
      const index = this.dataSource.data.indexOf(drawing, 0);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.drawingPreview = this.dataSource.data;
        this.dataObs.next(this.dataSource.data);
      }
    }
  }

  getBackgroundSelected(drawing: Drawing): string {
    return this.openDrawingService.getBackgroundSelected(drawing);
  }

  selectDrawing(drawing: Drawing) {
    this.openDrawingService.selectDrawing(drawing);
  }

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
}
