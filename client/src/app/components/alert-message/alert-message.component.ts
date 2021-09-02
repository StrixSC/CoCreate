import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorMessage } from '../../model/error-message.model';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss'],
})
export class AlertMessageComponent {

  errorMessage: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorMessage, public dialogRef: MatDialogRef<AlertMessageComponent>) { }

  /// ferme la boite de dialogue

  close(): void {
    this.dialogRef.close();
  }

}
