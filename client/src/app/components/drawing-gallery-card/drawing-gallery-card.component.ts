import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingPreviewDialogComponent } from '../drawing-preview-dialog/drawing-preview-dialog.component';

@Component({
  selector: 'app-drawing-gallery-card',
  templateUrl: './drawing-gallery-card.component.html',
  styleUrls: ['./drawing-gallery-card.component.scss']
})
export class DrawingGalleryCardComponent {

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(DrawingPreviewDialogComponent, {height: '580px'});

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }


}
