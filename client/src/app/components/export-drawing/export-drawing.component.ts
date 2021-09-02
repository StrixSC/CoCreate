import { Component, ViewChild } from '@angular/core';
import { MatDialogRef, MatRadioGroup } from '@angular/material';
import { ExportService } from 'src/app/services/export/export.service';

@Component({
  selector: 'app-export-drawing',
  templateUrl: './export-drawing.component.html',
  styleUrls: ['./export-drawing.component.scss'],
})
export class ExportDrawingComponent  {

  readonly exportOptions = ['BMP', 'JPG', 'PNG', 'SVG'];

  @ViewChild('radioGroup', { static: false }) selectionInput: MatRadioGroup;

  constructor(
    public dialogRef: MatDialogRef<ExportDrawingComponent>,
    public exportService: ExportService,
  ) { }

  /// permet d'exporter le dessin dans le format selectionne
  export(): void {
    this.exportService.exportToFormat(this.selectionInput.value);
  }
  /// ferme la boite de dialogue
  close(): void {
    this.dialogRef.close();
  }
}
