import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollaborationPasswordFormService } from 'src/app/services/collaboration-password-form/collaboration-password-form.service';

@Component({
  selector: 'app-collaboration-password-form-dialog',
  templateUrl: './collaboration-password-form-dialog.component.html',
  styleUrls: ['./collaboration-password-form-dialog.component.scss']
})
export class CollaborationPasswordFormDialogComponent implements OnInit{
  form: FormGroup
  @Input() enterCollaborationForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
    
    private passwordService: CollaborationPasswordFormService,
    //@Inject(MAT_DIALOG_DATA) public data: any,
    ) { }
  ngOnInit(): void {
    this.form = new FormGroup(
      {
        password: this.passwordService.form,
      },
    );
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
}
