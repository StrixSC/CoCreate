import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SaveDrawingComponent } from 'src/app/components/save-drawing/save-drawing.component';
import { DrawingService } from '../drawing/drawing.service';

const WIDTH_SAVE_DRAWING_DIALOG = '600px';
const MAX_HEIGHT_SAVE_DRAWING_DIALOG = '700px';
const MIN_HEIGHT_SAVE_DRAWING_DIALOG = '500px';

/// Gestionnaire des dialogues de save drawing
@Injectable({
  providedIn: 'root',
})
export class SaveDrawingDialogService {

  constructor(private drawingService: DrawingService, public dialog: MatDialog) { }

  /// Permet l'ouverture du save drawing dialog avec les bons parametres
  openDialog(): void {
    if (this.drawingService.isCreated && !this.drawingService.isSaved) {
      this.dialog.open(SaveDrawingComponent, {
        width: WIDTH_SAVE_DRAWING_DIALOG,
        maxHeight: MAX_HEIGHT_SAVE_DRAWING_DIALOG,
        minHeight: MIN_HEIGHT_SAVE_DRAWING_DIALOG,
        disableClose: true,
      });
    }
  }

}
