import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-drawing-preview-dialog',
  templateUrl: './drawing-preview-dialog.component.html',
  styleUrls: ['./drawing-preview-dialog.component.scss']
})
export class DrawingPreviewDialogComponent  {

    constructor(
      public dialogRef: MatDialogRef<DrawingPreviewDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }

}
