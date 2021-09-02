import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertMessageComponent } from 'src/app/components/alert-message/alert-message.component';
import { NewDrawingAlertComponent } from 'src/app/components/new-drawing/new-drawing-alert/new-drawing-alert.component';
import { OpenDrawingComponent } from 'src/app/components/open-drawing/open-drawing.component';
import { ErrorMessage } from 'src/app/model/error-message.model';
import { Drawing } from '../../../../../common/communication/drawing';
import { DrawingRequestService } from '../drawing-request/drawing-request.service';
import { DrawingService } from '../drawing/drawing.service';
import { GetDrawingRequestService } from '../get-drawing-request/get-drawing-request.service';
import { OpenLocalService } from '../open-local/open-local-file.service';
import { TagService } from '../tag/tag.service';
import { SOURCE_KEY } from '../tools/tools-constants';
import { LOCAL_TYPE } from './open-drawing-constant';
@Injectable({
  providedIn: 'root',
})
export class OpenDrawingService {
  errorDialog = '';
  selectedDrawing: Drawing | null;
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  selectedTags: string[] = [];
  allTags: string[] = [];
  localDrawingThumbnail = '';

  constructor(
    private getDrawingRequestService: GetDrawingRequestService,
    public dialog: MatDialog,
    private tagService: TagService,
    private drawingService: DrawingService,
    private openDrawingLocalService: OpenLocalService,
    private drawingRequest: DrawingRequestService) {
    this.selectedTags = [];
    this.getTags();

  }
  /// Permet de selectionner un dessin
  selectDrawing(drawing: Drawing): void {
    this.selectedDrawing = drawing;
  }

  /// Permet de recuperer les dessins
  getDrawings(): Observable<Drawing[]> {
    return this.getDrawingRequestService.getDrawings();
  }

  /// Permet de choisir le background selon la selection
  getBackgroundSelected(drawing: Drawing): string {
    return (this.selectedDrawing && this.selectedDrawing === drawing) ? 'grey' : 'white';
  }
  getTags(): void {
    this.tagService.retrieveTags().subscribe((tags: string[]) => this.allTags = tags);
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this.filter(tag) : this.allTags.slice()));

  }

  /// Ajout d'un tag
  add(event: MatChipInputEvent, isMatAutoCompleteOpen: boolean): void {

    if (isMatAutoCompleteOpen) {
      const input = event.input;
      const value = event.value;

      if ((value || '').trim()) {
        if (!this.selectedTags.includes(value.trim())) {
          this.selectedTags.push(value.trim());
        }
      }

      // Renouveler la valeur du input
      if (input) {
        input.value = '';
      }

      this.tagCtrl.setValue(null);
      this.selectedDrawing = null;

    }
  }

  /// Retrait d'un tag
  remove(tag: string): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
    this.selectedDrawing = null;
  }

  /// Filter les tags
  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter((tag) => tag.toLowerCase().indexOf(filterValue) === 0);
  }

  /// Remis a zero des form et erreur
  reset(): void {
    this.errorDialog = '';
    this.localDrawingThumbnail = '';
    this.selectedTags = [];
    this.selectedDrawing = null;
  }

  // Choisir un tag a partir de la suggestion
  selectTag(tagName: string): void {
    this.selectedTags.push(tagName);
    this.tagCtrl.setValue(null);
    this.selectedDrawing = null;

  }

  // ouvre un nouveau dessin  avec l'ancien drawing
  async deleteDrawing(drawing: Drawing): Promise<boolean> {
    const errorMessage: ErrorMessage = { title: 'Supprimer ' + drawing.name, description: 'Êtes-vous certains de vouloir supprimer ce dessin, ce dernier ne sera pas récupérable !' };
    const alert = this.dialog.open(AlertMessageComponent, {
      role: 'alertdialog',
      data: errorMessage,
    });
    const result: boolean = await alert.afterClosed().toPromise();
    if (result) {
      const res = await this.drawingRequest.deleteDrawing(drawing).toPromise();
      this.selectedDrawing = null;
      return res.success;
    }
    return result;
  }

  // ouvre un nouveau dessin  avec l'ancien drawing
  accept(dialogRef: MatDialogRef<OpenDrawingComponent>, type: number): void {
    if (!this.selectedDrawing) { return; }
    if (this.drawingService.isCreated) {
      const alert = this.dialog.open(NewDrawingAlertComponent, {
        role: 'alertdialog',
      });
      alert.afterClosed().subscribe((result: boolean) => {
        if (result) {
          if (type === LOCAL_TYPE) {
            this.openDrawingLocal(dialogRef);
          } else {
            this.openDrawingOnline(dialogRef);
          }
        }
      });
    } else {
      if (type === LOCAL_TYPE) {
        this.openDrawingLocal(dialogRef);
      } else {
        this.openDrawingOnline(dialogRef);
      }
    }
  }

  /// Permet d'ouvrir un dessin du serveur
  openDrawingOnline(dialogRef: MatDialogRef<OpenDrawingComponent>): void {
    if (!this.selectedDrawing) { return; }
    this.drawingService.isCreated = true;
    this.drawingRequest.openDrawing(this.selectedDrawing.path).subscribe((drawingString) => {
      this.openDrawing(dialogRef, drawingString);
    });
  }

  /// Permet d'ouvrir un dessin local
  openDrawingLocal(dialogRef: MatDialogRef<OpenDrawingComponent>): void {
    if (!this.selectedDrawing) { return; }
    this.drawingService.isCreated = true;
    this.openDrawing(dialogRef, this.selectedDrawing.path);
  }

  /// Permet d'ouvrir un dessin
  private openDrawing(dialogRef: MatDialogRef<OpenDrawingComponent>, drawingString: string): void {
    const parser = new DOMParser();
    const documentSvg = parser.parseFromString(drawingString, 'image/svg+xml');
    this.drawingService.openDrawing(documentSvg.children[0] as SVGElement);
    dialogRef.close();
  }

  /// Permet de manipuler les fichiers ouverts
  handleFile(files: FileList): Observable<any> {
    this.openDrawingLocalService.handleFile(files).subscribe((documentString: string) => {
      const parser = new DOMParser();
      const xmlParser = new XMLSerializer();
      const documentSvg = parser.parseFromString(documentString, 'image/svg+xml');

      let body = '';
      documentSvg.children[0].childNodes.forEach((htmlElement) => {
        body = body + xmlParser.serializeToString(htmlElement);
      });
      const sourceKey = documentSvg.children[0].attributes.getNamedItem('sourceKey');
      if (sourceKey && sourceKey.value === SOURCE_KEY) {
        const drawing: Drawing = {
          name: (files.item(0) as File).name,
          tags: [],
          fileName: (files.item(0) as File).name,
          path: documentString,
          createdAt: new Date((files.item(0) as File).lastModified),
        };
        this.localDrawingThumbnail = body;
        this.selectDrawing(drawing);
        this.errorDialog = '';
      } else {
        this.errorHandling();
      }
    });
    return this.openDrawingLocalService.handleFile(files);
  }

  errorHandling(): void {
    this.errorDialog = `Erreur. Le fichier choisi ne peut pas être ouvert, ouvrir un autre fichier.
      Seulement les fichiers SVG créés par Polydessin peuvent être ouvert`;
  }
}
