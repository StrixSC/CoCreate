import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { DrawingRequestService } from '../drawing-request/drawing-request.service';
import { ErrorMessageService } from '../error-message/error-message.service';
import { ExportService } from '../export/export.service';
import { RendererProviderService } from '../renderer-provider/renderer-provider.service';
import { TagService } from '../tag/tag.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { SOURCE_KEY } from '../tools/tools-constants';

/// Service s'occuppant de la gestion de l'enregistrement du dessin sur le serveur
@Injectable({
  providedIn: 'root',
})
export class SaveDrawingService {
  tagCtrl = new FormControl();
  nameCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  allTags: string[] = [];
  saveEnabled = true;

  constructor(
    private drawingService: DrawingService,
    private gridService: GridService,
    private tagService: TagService,
    private saveRequestService: DrawingRequestService,
    private errorMessage: ErrorMessageService,
    private exportService: ExportService,
    private rendererProvider: RendererProviderService,
    private selectionService: SelectionToolService,
  ) {
    this.nameCtrl.setValidators([Validators.required]);
    this.reset();
  }

  /// Retourne tous les tags
  getAllTags(): string[] {
    return this.allTags;
  }

  /// Réinitialise les information de save-drawing
  reset(): void {
    this.tagCtrl.reset();
    this.nameCtrl.reset();
    this.tags = [];
    this.tagService.retrieveTags().subscribe((tags: string[]) => this.allTags = tags);
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this.filter(tag) : this.allTags.slice()));
  }

  /// Ajoute un tag dans la liste de tag choisi
  add(event: MatChipInputEvent, isMatAutoCompleteOpen: boolean): void {
    if (!isMatAutoCompleteOpen) {
      const input = event.input;
      const value = event.value;
      if ((value).trim() && !this.tags.includes(value.trim())) {
        this.tags.push(value.trim());

      }
      if (input) {
        input.value = '';
      }

      this.tagCtrl.setValue(null);
    }
  }

  /// Retrait d'un tag
  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  /// Selection d'un tag
  selected(tagValue: string): void {
    this.tags.push(tagValue);
    this.tagCtrl.setValue(null);
  }

  /// Filtrer les tag pour avoir seulement un de chaque
  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
  }

  /// Sauvegarder le dessins sur le serveur
  async save(): Promise<boolean> {
    this.saveEnabled = false;
    const xmlSerializer = new XMLSerializer();

    // soustraire les elements qu'ont ne veut pas sauvegarder
    const isGridActivated = this.gridService.activateGrid.value;
    this.gridService.activateGrid.setValue(false);
    this.selectionService.hideSelection();

    const svgObject = this.drawingService.drawing;
    svgObject.setAttribute('id', this.drawingService.id);
    svgObject.setAttribute('sourceKey', SOURCE_KEY);
    svgObject.setAttribute('name', 'default');
    this.rendererProvider.renderer.setStyle(svgObject, 'backgroundColor',
      `rgba(${this.drawingService.color.r},${this.drawingService.color.g},${this.drawingService.color.b},${this.drawingService.alpha})`,
    );
    const drawingBlob = new Blob([xmlSerializer.serializeToString(svgObject)], { type: 'image/svg+xml;charset=utf-8' });

    // restaurer les elements precedemment soustrait
    this.gridService.activateGrid.setValue(isGridActivated);
    this.selectionService.showSelection();
    try {
      await this.saveRequestService.addDrawing(drawingBlob, this.nameCtrl.value, this.tags).toPromise();
    } catch {
      this.errorMessage.showError('Test', 'Erreur de sauvegarde de dessin sur le serveur');
      this.saveEnabled = true;
      return false;
    }
    this.saveEnabled = true;
    this.drawingService.saved = true;
    return true;
  }
  // sauvegarde du dessin en fichier local svg

  async saveLocally(): Promise<boolean> {
    const isGridActivated = this.gridService.activateGrid.value;

    this.gridService.activateGrid.setValue(false);
    try {
      await this.exportService.exportAsSVG();
    } catch {
      this.errorMessage.showError('Test', 'Erreur de sauvegarde de dessin localement');
      return false;
    }
    this.gridService.activateGrid.setValue(isGridActivated);

    return true;

  }
}
