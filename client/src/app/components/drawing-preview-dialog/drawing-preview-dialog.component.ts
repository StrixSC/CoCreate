import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { ICollaborationJoinPayload, ICollaborationConnectPayload } from './../../model/ICollaboration.model';
import { AuthService } from './../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';

@Component({
  selector: 'app-drawing-preview-dialog',
  templateUrl: './drawing-preview-dialog.component.html',
  styleUrls: ['./drawing-preview-dialog.component.scss']
})
export class DrawingPreviewDialogComponent {
  drawing: IGalleryEntry;
  exceptionSubscription: Subscription;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DrawingPreviewDialogComponent>,
    private syncService: SyncCollaborationService,
    private snackbar: MatSnackBar,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.drawing = data;
    console.log(this.drawing)
  }

  ngOnInit(): void {
    this.exceptionSubscription = this.syncService.onCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    const payload = {
      userId: this.auth.activeUser!.uid,
      collaborationId: this.drawing.collaboration_id,
      type: this.drawing.type,
      password: '',
    } as ICollaborationJoinPayload

    if (this.drawing.is_member) {
      this.syncService.sendConnectCollaboration(payload);
    } else if (!this.drawing.is_member) {
      this.syncService.sendJoinCollaboration(payload);
    }
    
  }

}
