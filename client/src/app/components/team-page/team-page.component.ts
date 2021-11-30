import { TeamInfoComponent } from './../team-info/team-info.component';
import { AuthService } from './../../services/auth.service';
import { TeamPasswordDialogComponent } from './../team-password-dialog/team-password-dialog.component';
import { Subscription, merge } from 'rxjs';
import { CreateTeamDialogComponent } from './../create-team-dialog/create-team-dialog.component';
import { TeamService } from './../../services/team.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { v4 } from 'uuid';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange, MatDialog, MatSnackBar, MatDialogConfig, PageEvent, MatPaginator } from '@angular/material';
import { TeamType, TeamResponse } from 'src/app/model/team-response.model';

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss']
})
export class TeamPageComponent implements OnInit {

  showCreatedByMeSwitch: boolean = false;
  buttonsLoading: boolean = false;

  activeTeamName: string = "";

  dialogOptions = {
    width: '800px',
    height: '800px'
  } as MatDialogConfig;

  @ViewChild('paginator', { static: false })
  paginator: MatPaginator;

  @ViewChild('fullTeamSwitch', { static: false })
  fullTeamSwitch: MatSlideToggle;

  @ViewChild('myTeamSwitch', { static: false })
  myTeamSwitch: MatSlideToggle;

  @ViewChild('myCreatedTeamSwitch', { static: false })
  myCreatedTeamSwitch: MatSlideToggle;

  isLoading: boolean = false;
  queryLoading: boolean = false;
  leaveLoading: boolean = false;
  searchForm: FormGroup;
  teamCreatedSubscription: Subscription;
  joinFinishedSubscription: Subscription;
  joinedSubscription: Subscription;
  joinErrorSubscription: Subscription;
  leaveException: Subscription;
  leaveFinishedSubscription: Subscription;
  leftSubscription: Subscription;
  activeOffset = 0;
  activeLimit = 12;
  activeTotal = 0;

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

    this.leaveException = this.teamService.onLeaveException().subscribe((data: { message: string }) => {
      this.snackBar.open(data.message, 'OK', { duration: 5000 });
    });

    this.leftSubscription = this.teamService.onLeave().subscribe(() => {
      this.submitSearch();
    });

    this.leaveFinishedSubscription = this.teamService.onLeaveFinished().subscribe((data) => {
      this.leaveLoading = false;
      this.snackBar.open(`Succès! Vous avez quitté l'équipe "${data.teamName}!"`, 'OK', { duration: 5000 });
      this.submitSearch();
    });

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

  onJoin(team: TeamResponse): void {
    if (this.buttonsLoading) {
      return;
    }

    if (team.type === TeamType.Protected) {
      this.buttonsLoading = true;

      this.dialog.open(TeamPasswordDialogComponent, { width: '500px', data: team }).afterClosed().subscribe(() => {
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
    this.resetPaginationValues();
    this.submitSearch();
  }

  filterDrawing() {
    if (!this.query.value) {
      this.searchParams.delete('filter');
    } else {
      this.searchParams.set('filter', this.query.value)
    }

    this.resetPaginationValues();
    this.submitSearch();
  }

  filterFullTeams(event: MatSlideToggleChange) {
    // Add full=false
    if (event.checked) {
      this.searchParams.set('removeFull', 'false');
    } else {
      this.searchParams.delete('removeFull');
    }

    this.resetPaginationValues();
    this.submitSearch();
  }

  filterMyTeams(event: MatSlideToggleChange) {
    if (event.checked) {
      this.searchParams.set('amMember', 'true');
    } else {
      this.searchParams.delete('amMember');
    }
    this.resetPaginationValues();

    this.submitSearch();
  }

  filterMyCreatedTeams(event: MatSlideToggleChange) {
    if (event.checked) {
      this.searchParams.set('amOwner', 'true');
    } else {
      this.searchParams.delete('amOwner');
    }

    this.resetPaginationValues();
    this.submitSearch();
  }

  submitSearch(): void {
    let query = "?";
    query += `offset=${this.activeOffset}&limit=${this.activeLimit}&`;
    for (let [key, value] of this.searchParams) {
      query += `${key}=${value}&`
    }
    query = query.substr(0, query.length - 1); // remove the last & or the ? if no params.
    const teamSub = this.teamService.fetchTeams(query).subscribe((d: any) => {
      this.activeTotal = d.total;
      this.activeOffset = d.offset;
      this.activeLimit = d.limit;
      this.teams = d.teams;
      teamSub.unsubscribe();
    }, (error) => {
      this.snackBar.dismiss();
      teamSub.unsubscribe();
      this.snackBar.open("Une erreur s'est produite lors de la requête, veuillez essayez à nouveau...", 'OK', { duration: 5000 });
    })
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex;
    this.activeOffset = (pageIndex * this.activeLimit);
    this.submitSearch();
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

    if (this.leaveException) {
      this.leaveException.unsubscribe();
    }

    if (this.leaveFinishedSubscription) {
      this.leaveFinishedSubscription.unsubscribe();
    }

    if (this.leftSubscription) {
      this.leftSubscription.unsubscribe();
    }

  }

  leaveTeam(team: TeamResponse): void {
    this.teamService.sendLeave({ teamId: team.teamId });
  }

  openInfo(team: TeamResponse): void {
    this.dialog.open(TeamInfoComponent, { ...this.dialogOptions, data: team }).afterClosed().subscribe((data) => {
      if (data) {
        this.resetPaginationValues();
        this.submitSearch();
      }
    });
  }

  resetPaginationValues(): void {
    this.paginator.firstPage();
    this.activeLimit = 12;
    this.activeOffset = 0;
  }

}
