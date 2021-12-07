import { Subscription } from 'rxjs';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { AuthService } from './../../services/auth.service';
import { ICollaborationJoinPayload } from './../../model/ICollaboration.model';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-collaboration-password-form-dialog',
  templateUrl: './collaboration-password-form-dialog.component.html',
  styleUrls: ['./collaboration-password-form-dialog.component.scss']
})
export class CollaborationPasswordFormDialogComponent implements OnInit {
  passwordForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean;

  exceptionSubscription: Subscription;
  @Input() enterCollaborationForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private syncCollaborationService: SyncCollaborationService,
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public drawing: any,
  ) { }

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]]
    });

    this.exceptionSubscription = this.syncCollaborationService.onCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.isLoading = false;
      this.passwordForm.enable();
    });
  }

  ngOnDestroy(): void {
    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }
  }

  get password(): any {
    return this.passwordForm.get('password');
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.passwordForm.disable();
      this.isLoading = true;
      const payload = {
        collaborationId: this.drawing.collaboration_id,
        userId: this.auth.activeUser!.uid,
        type: this.drawing.type,
        password: this.password.value
      } as ICollaborationJoinPayload;

      this.syncCollaborationService.sendJoinCollaboration(payload);
    }
  }
}
