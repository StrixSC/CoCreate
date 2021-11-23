import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingPreviewDialogComponent } from '../drawing-preview-dialog/drawing-preview-dialog.component';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

@Component({
  selector: 'app-drawing-gallery-card',
  templateUrl: './drawing-gallery-card.component.html',
  styleUrls: ['./drawing-gallery-card.component.scss']
})
export class DrawingGalleryCardComponent {
  
  @Input() public drawing: IGalleryEntry;
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    if(this.drawing.type!=="Protected") {
      const dialogRef = this.dialog.open(DrawingPreviewDialogComponent,
      {
        data: this.drawing
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('The dialog was closed');
      });
    }
    else if(this.drawing.type==="Protected") {
      const dialogRef = this.dialog.open(CollaborationPasswordFormDialogComponent,
      {
        data: this.drawing
      });

      dialogRef.afterClosed().subscribe(() => {
        console.log('The dialog was closed');
      });
    }

  }
}
