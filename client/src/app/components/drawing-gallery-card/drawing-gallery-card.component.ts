import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingPreviewDialogComponent } from '../drawing-preview-dialog/drawing-preview-dialog.component';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';

@Component({
  selector: 'app-drawing-gallery-card',
  templateUrl: './drawing-gallery-card.component.html',
  styleUrls: ['./drawing-gallery-card.component.scss']
})
export class DrawingGalleryCardComponent {
  
  @Input() public drawing: IGalleryEntry;
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DrawingPreviewDialogComponent,
      {
        data: this.drawing
      });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }


}
