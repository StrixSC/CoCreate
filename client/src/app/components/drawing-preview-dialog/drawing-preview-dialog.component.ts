import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Drawing1 } from '../../../../../common/communication/new-drawing-parameters';

@Component({
  selector: 'app-drawing-preview-dialog',
  templateUrl: './drawing-preview-dialog.component.html',
  styleUrls: ['./drawing-preview-dialog.component.scss']
})
export class DrawingPreviewDialogComponent  {
    drawing: Drawing1;
    constructor(
      public dialogRef: MatDialogRef<DrawingPreviewDialogComponent>,
      private router: Router,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
      this.drawing = data;
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    accessDrawing() : void {
      this.router.navigateByUrl('');
    }

}
