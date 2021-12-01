import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.scss']
})
export class DeleteConfirmationDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { message: string, submessage: string },
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
  ) { }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
