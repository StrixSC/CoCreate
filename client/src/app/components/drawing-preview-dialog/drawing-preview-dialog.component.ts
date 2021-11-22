import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';

@Component({
  selector: 'app-drawing-preview-dialog',
  templateUrl: './drawing-preview-dialog.component.html',
  styleUrls: ['./drawing-preview-dialog.component.scss']
})
export class DrawingPreviewDialogComponent  {
    drawing: IGalleryEntry;
    constructor(
      public dialogRef: MatDialogRef<DrawingPreviewDialogComponent>,
      private router: Router,
      private syncCollaboration: SyncCollaborationService,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
      this.drawing = data;
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    deleteDrawing(userID: string, collaborationId: string) : void {
      this.syncCollaboration.sendDeleteCollaboration(userID, collaborationId);
    }

    accessDrawing() : void {
      this.router.navigateByUrl('');
      this.dialogRef.close();
      this.dialogRef.afterClosed().subscribe(() => {
        console.log('The dialog was closed');
      });
    }

}
