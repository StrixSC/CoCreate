import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatDialogRef,
  MatTabChangeEvent,
} from '@angular/material';
import { Observable } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SaveDrawingService } from 'src/app/services/save-drawing/save-drawing.service';

/// Component pour visualiser le tumbnail et enregistrer le dessin
export enum option { saveServer, saveLocal }

@Component({
  selector: 'app-save-drawing',
  templateUrl: './save-drawing.component.html',
  styleUrls: ['./save-drawing.component.scss'],
})
export class SaveDrawingComponent implements AfterViewInit {
  // initialise l'option a sauverServeur (defaut)
  selectedOption: number = option.saveServer;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<
    HTMLInputElement
  >;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild('svg', { static: false }) svg: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<SaveDrawingComponent>,
    private saveDrawingService: SaveDrawingService,
    private drawingService: DrawingService,
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit(): void {
    this.dialogRef.afterOpened().subscribe(() => {
      this.renderer.setAttribute(
        this.svg.nativeElement,
        'viewBox',
        '0 0 ' + this.drawingService.width + ' ' + this.drawingService.height,
      );
      this.renderer.setStyle(
        this.svg.nativeElement,
        'backgroundColor',
        this.drawingService.rgbaColorString,
      );
      this.svg.nativeElement.innerHTML = this.drawingService.drawing.innerHTML;
    });
    this.dialogRef.afterClosed().subscribe(() => {
      this.saveDrawingService.reset();
    });
  }

  get nameCtrl(): FormControl {
    return this.saveDrawingService.nameCtrl;
  }

  get tags(): string[] {
    return this.saveDrawingService.tags;
  }

  get tagCtrl(): FormControl {
    return this.saveDrawingService.tagCtrl;
  }

  get filteredTags(): Observable<string[]> {
    return this.saveDrawingService.filteredTags;
  }

  get saveEnabled(): boolean {
    return this.saveDrawingService.saveEnabled;
  }
  get isSaveButtonEnabled(): boolean {
    if (this.selectedOption === option.saveServer) {
      return !this.saveEnabled || this.nameCtrl.invalid;
    } else {
      return false;
    }
  }
  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.selectedOption = tabChangeEvent.index;
  }
  /// Ajout d'un tag
  add(event: MatChipInputEvent): void {
    this.saveDrawingService.add(event, this.matAutocomplete.isOpen);
  }

  /// Retrait d'un tag
  remove(tag: string): void {
    this.saveDrawingService.remove(tag);
  }

  /// Selection d'un tag
  selected(event: MatAutocompleteSelectedEvent): void {
    this.saveDrawingService.selected(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
  }

  /// Enregistrement du dessin
  async save(): Promise<void> {
    if (this.selectedOption === option.saveServer) {
      const saveSucceed = await this.saveDrawingService.save();
      if (saveSucceed) {
        this.close();
      }
    } else {
      const saveSucceed = await this.saveDrawingService.saveLocally();
      if (saveSucceed) {
        this.close();
      }
    }
  }
 /// ferme la boite de dialogue
  close(): void {
    this.dialogRef.close();
  }
}
