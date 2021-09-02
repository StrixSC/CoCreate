import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExportDrawingComponent } from 'src/app/components/export-drawing/export-drawing.component';
import { DrawingService } from '../drawing/drawing.service';

/// Gestion de dialogue de ExportService
@Injectable({
  providedIn: 'root',
})
export class ExportDialogService {

  constructor(private drawingService: DrawingService, public dialog: MatDialog) { }

  /// Permet d'ouvrir le dialogue du service export
  openDialog(): void {
    if (this.drawingService.isCreated) {
      this.dialog.open(ExportDrawingComponent, {
        width: '800px',
        maxHeight: '800px',
        autoFocus: false,
      });
    }
  }
}
