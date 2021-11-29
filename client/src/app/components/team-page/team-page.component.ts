import { AuthService } from './../../services/auth.service';
import { TeamPasswordDialogComponent } from './../team-password-dialog/team-password-dialog.component';
import { Subscription, merge } from 'rxjs';
import { CreateTeamDialogComponent } from './../create-team-dialog/create-team-dialog.component';
import { TeamService } from './../../services/team.service';
import { TeamViewerComponent } from './../team-viewer/team-viewer.component';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { v4 } from 'uuid';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange, MatDialog, MatSnackBar, MatDialogConfig } from '@angular/material';

export enum TeamType {
  Protected = "Protected",
  Public = "Public",
  None = ""
}

export enum MemberType {
  Owner = "Owner",
  Regular = "Regular",
}

export interface TeamResponse {
  teamId: string,
  createdAt: string,
  teamName: string,
  bio: string,
  maxMemberCount: number,
  type: string,
  avatarUrl: string,
  mascot: string,
  authorUsername: string,
  authorAvatarUrl: string,
  team_members: { member_id: string, member_type: MemberType }[],
  isMember: boolean,
  isOwner: boolean
}

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  showCreatedByMeSwitch: boolean = false;
  totalTeamLength = 0;
  buttonsLoading: boolean = false;

  activeTeamName: string = "";

  dialogOptions = {
    width: '800px',
    height: '800px'
  } as MatDialogConfig;

  @ViewChild('fullTeamSwitch', { static: false })
  fullTeamSwitch: MatSlideToggle;

  @ViewChild('myTeamSwitch', { static: false })
  myTeamSwitch: MatSlideToggle;

  @ViewChild('myCreatedTeamSwitch', { static: false })
  myCreatedTeamSwitch: MatSlideToggle;

  isLoading: boolean = false;
  queryLoading: boolean = false;
  searchForm: FormGroup;
  teamCreatedSubscription: Subscription;
  joinFinishedSubscription: Subscription;
  joinedSubscription: Subscription;
  joinErrorSubscription: Subscription;

  searchParams: Map<string, string> = new Map();
  types = [
    {
      key: TeamType.None, value: "Tout"
    },
    {
      key: TeamType.Protected, value: 'Protégé'
    },
    {
      key: TeamType.Public, value: 'Public'
    }
  ]

  teams = [];
  constructor(
    private snackBar: MatSnackBar,
    private teamService: TeamService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.searchForm = this.fb.group({
      query: [''],
      type: [''],
    });
    this.submitSearch();

    this.teamCreatedSubscription = this.teamService.onCreated().subscribe(() => this.submitSearch());
    this.joinedSubscription = this.teamService.onJoin().subscribe((d) => this.submitSearch());
    this.joinFinishedSubscription = this.teamService.onJoinFinished().subscribe((d) => {
      this.buttonsLoading = false;
      this.snackBar.open(`Super! Vous avez rejoint l'équipe "${this.activeTeamName}"!`, 'OK', { duration: 5000 });
      this.activeTeamName = "";
    });

    this.joinErrorSubscription = this.teamService.onJoinException().subscribe(() => {
      // TODO: join exception handling
    });

    this.isLoading = false;
  }

  get query(): AbstractControl {
    return this.searchForm.get('query')!
  }

  get type(): AbstractControl {
    return this.searchForm.get('type')!
  }

  openDialog(team: TeamResponse): void {
    this.dialog.open(TeamViewerComponent, {
      width: '800px',
      height: '800px',
      data: team.teamId
    });
  }

  onJoin(team: TeamResponse): void {
    if (this.buttonsLoading) {
      return;
    }

    if (team.type === TeamType.Protected) {
      this.buttonsLoading = true;

      this.dialog.open(TeamPasswordDialogComponent, this.dialogOptions).afterClosed().subscribe(() => {
        this.buttonsLoading = false;
      });

    } else {
      this.activeTeamName = team.teamName;
      this.buttonsLoading = true;
      this.teamService.sendJoin({ userId: this.auth.activeUser!.uid, teamId: team.teamId });
    }
  }

  openCreateTeamDialog(): void {
    this.dialog.open(CreateTeamDialogComponent, this.dialogOptions).afterClosed().subscribe((d) => {
      console.log(d);
    })
  }

  changeType(e: any) {
    if (!this.type.value) {
      this.searchParams.delete('type');
    } else {
      this.searchParams.set('type', this.type.value);
    }
    this.submitSearch();
  }

  filterDrawing() {
    if (!this.query.value) {
      this.searchParams.delete('filter');
    } else {
      this.searchParams.set('filter', this.query.value)
    }
    this.submitSearch();
  }

  filterFullTeams(event: MatSlideToggleChange) {
    // Add full=false
    if (event.checked) {
      this.searchParams.set('removeFull', 'false');
    } else {
      this.searchParams.delete('removeFull');
    }

    this.submitSearch();
  }

  filterMyTeams(event: MatSlideToggleChange) {
    if (event.checked) {
      this.searchParams.set('amMember', 'true');
    } else {
      this.searchParams.delete('amMember');
    }

    this.submitSearch();
  }

  filterMyCreatedTeams(event: MatSlideToggleChange) {
    if (event.checked) {
      this.searchParams.set('amOwner', 'true');
    } else {
      this.searchParams.delete('amOwner');
    }

    this.submitSearch();
  }

  submitSearch(): void {
    let query = "?";
    for (let [key, value] of this.searchParams) {
      query += `${key}=${value}&`
    }
    query = query.substr(0, query.length - 1); // remove the last & or the ? if no params.

    this.teamService.fetchTeams(query).subscribe((d: any) => {
      console.log(d);
      this.totalTeamLength = d.total_teams_count;
      this.teams = d.teams;
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      this.snackBar.dismiss();
      this.snackBar.open("Une erreur s'est produite lors de la requête, veuillez essayez à nouveau...", 'OK', { duration: 5000 });
    })
  }

  ngOnDestroy(): void {
    if (this.teamCreatedSubscription) {
      this.teamCreatedSubscription.unsubscribe();
    }

    if (this.joinedSubscription) {
      this.joinedSubscription.unsubscribe();
    }

    if (this.joinErrorSubscription) {
      this.joinErrorSubscription.unsubscribe();
    }

    if (this.joinFinishedSubscription) {
      this.joinErrorSubscription.unsubscribe();
    }
  }

}
