import { TeamResponse } from './../../model/team-response.model';
import { Subscription } from 'rxjs';
import { TeamService } from './../../services/team.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

@Component({
  selector: 'app-team-password-dialog',
  templateUrl: './team-password-dialog.component.html',
  styleUrls: ['./team-password-dialog.component.scss']
})
export class TeamPasswordDialogComponent implements OnInit {

  passwordForm: FormGroup;
  isLoading: boolean = false;
  teamJoinFinishedSubscription: Subscription;
  teamJoinFailedSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: TeamResponse,
  ) { }

  ngOnInit() {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]]
    });

    this.teamJoinFailedSubscription = this.teamService.onJoinException().subscribe((d) => {
      this.dialogRef.disableClose = false;
      this.snackbar.open(d.message, 'OK', { duration: 5000 });
      this.isLoading = false;
    });

    this.teamJoinFinishedSubscription = this.teamService.onJoinFinished().subscribe((d) => {
      this.dialogRef.disableClose = false;
      this.snackbar.open(`Super! Vous avez rejoint l'équipe "${this.data.teamName}"!`, 'OK', { duration: 5000 })
      this.isLoading = false;
      this.dialogRef.close();
    });

  }

  onSubmit(): void {
    if (!this.isLoading && this.passwordForm.valid) {
      this.dialogRef.disableClose = true;
      this.isLoading = true;
      this.teamService.sendJoin({ userId: this.auth.activeUser!.uid, teamId: this.data.teamId, password: this.password.value })
    }
  }

  ngOnDestroy(): void {
    if (this.teamJoinFinishedSubscription) {
      this.teamJoinFinishedSubscription.unsubscribe();
    }
  }

  get password(): AbstractControl {
    return this.passwordForm.get("password")!;
  }

}
