import { Subscription } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { TeamResponse } from 'src/app/model/team-response.model';
import { AuthService } from 'src/app/services/auth.service';
import { TeamService } from 'src/app/services/team.service';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

@Component({
  selector: 'app-team-info',
  templateUrl: './team-info.component.html',
  styleUrls: ['./team-info.component.scss']
})
export class TeamInfoComponent implements OnInit {

  isLoading: boolean;
  teamInfo: any;
  teamSub: Subscription;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public team: TeamResponse,
  ) { }

  ngOnInit() {
    this.teamSub = this.teamService.fetchTeamById(this.team.teamId).subscribe((d) => {
      if (d) {
        console.log(d);
      }
    });

    this.teamInfo
    this.isLoading = false;
  }

}
