import { TeamType } from './../../model/team-response.model';
import { Subscription } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { TeamResponse } from 'src/app/model/team-response.model';
import { AuthService } from 'src/app/services/auth.service';
import { TeamService } from 'src/app/services/team.service';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

interface ITeamUpdateResponse {
  teamId: string,
  author_username: string,
  author_avatar_url: string,
  currentMemberCount: number,
  maxMemberCount: number,
  onlineMemberCount: number,
  teamName: string,
  teamAvatarUrl: string,
  bio: string,
  mascot: string,
  type: string,
}

@Component({
  selector: 'app-team-info',
  templateUrl: './team-info.component.html',
  styleUrls: ['./team-info.component.scss']
})
export class TeamInfoComponent implements OnInit {

  isLoading: boolean;
  teamInfo: any;
  teamSub: Subscription;
  updateForm: FormGroup;
  updatedSubscription: Subscription;
  updateExceptionSubscription: Subscription;
  updateFinishedSubscription: Subscription;

  displayedColumns = ['username', 'status', 'joinedOn', 'type'];
  drawingsColumns = ['title', 'memberCount', 'collaborationId', 'delete']
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private teamService: TeamService,
    public dialogRef: MatDialogRef<CollaborationPasswordFormDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public team: TeamResponse,
  ) { }

  ngOnInit() {
    this.isLoading = false;
    this.updateForm = this.fb.group({
      teamName: [this.team.teamName, [Validators.minLength(4), Validators.maxLength(256), Validators.required]],
      bio: [this.team.bio, [Validators.maxLength(1024)]],
      type: [this.team.type, [Validators.required]],
      password: ['', []],
      maxMemberCount: [this.team.maxMemberCount, [Validators.min(1), Validators.max(30)]],
      mascot: [this.team.mascot, []]
    });

    this.teamSub = this.teamService.fetchTeamById(this.team.teamId).subscribe((d: any) => {
      if (d) {
        this.teamInfo = d
        console.log(d);
      }
    });

    this.updateFinishedSubscription = this.teamService.onUpdateFinished().subscribe(() => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.snackbar.open("Succès! Votre équipe à été mise à jour!", "OK", { duration: 2000 })
    })

    this.updateExceptionSubscription = this.teamService.onUpdateException().subscribe((d) => {
      this.dialogRef.disableClose = false;
      this.isLoading = false;
      this.snackbar.open(d.message, "OK", { duration: 5000 })
    })

    this.teamInfo
  }

  get types(): any {
    return this.teamService.types;
  }

  get mascots(): any {
    return this.teamService.mascots;
  }

  get maxMemberCount(): AbstractControl {
    return this.updateForm.get('maxMemberCount')!;
  }

  get password(): AbstractControl {
    return this.updateForm.get('password')!;
  }

  get teamName(): AbstractControl {
    return this.updateForm.get('teamName')!;
  }

  get type(): AbstractControl {
    return this.updateForm.get('type')!;
  }

  get bio(): AbstractControl {
    return this.updateForm.get('bio')!;
  }

  get mascot(): AbstractControl {
    return this.updateForm.get('mascot')!;
  }

  onUpdateSubmit(): void {
    if (this.valid()) {
      this.isLoading = true;
      this.teamService.sendUpdate({
        teamId: this.team.teamId,
        teamName: this.teamName.value,
        bio: this.bio.value,
        maxMemberCount: this.maxMemberCount.value,
        type: this.type.value,
        mascot: this.mascot.value,
        password: this.password.value
      });
      this.dialogRef.disableClose = true;
    }
  }

  changeType(e: any) {
    if (this.type.value === TeamType.Protected && this.team.type !== TeamType.Protected) {
      this.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]);
    } else {
      this.password.setValidators([]);
    }
  }

  valid(): boolean {
    return this.infoChanged() && this.team.isOwner && this.updateForm.valid;
  }

  infoChanged(): boolean {
    let infoChanged = false;

    if (this.team.teamName !== this.teamName.value) {
      infoChanged = true;
    }

    if (this.team.bio !== this.bio.value) {
      infoChanged = true;
    }

    if (this.team.mascot !== this.mascot.value) {
      infoChanged = true;
    }

    if (this.team.type !== this.type.value) {
      infoChanged = true;
    }

    if (this.team.maxMemberCount !== this.maxMemberCount.value) {
      infoChanged = true;
    }

    return infoChanged;
  }

}
