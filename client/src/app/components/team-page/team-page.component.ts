import { IConnectionEventData, IDisconnectionEventData } from './../../model/IChannel.model';
import { DeleteConfirmationDialogComponent } from './../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/chat/socket.service';
import { TeamInfoComponent } from './../team-info/team-info.component';
import { AuthService } from './../../services/auth.service';
import { TeamPasswordDialogComponent } from './../team-password-dialog/team-password-dialog.component';
import { Subscription, merge } from 'rxjs';
import { CreateTeamDialogComponent } from './../create-team-dialog/create-team-dialog.component';
import { TeamService } from './../../services/team.service';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
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
  currentLoadingIndex: number | null = null;
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
  joinFinishedSubscription: Subscription;
  connectionSubscription: Subscription;
  leaveFinishedSubscription: Subscription;
  refreshSubscription: Subscription;
  deleteFinishedSubscription: Subscription;
  exceptionSubscription: Subscription;
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

  teams: TeamResponse[] = [];
  constructor(
    private snackBar: MatSnackBar,
    private teamService: TeamService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private auth: AuthService,
    private socketService: SocketService
  ) { }

  ngOnInit() {

    this.searchForm = this.fb.group({
      query: [''],
      type: [''],
    });
    this.submitSearch();

    this.refreshSubscription = merge(
      this.teamService.onLeave(),
      this.teamService.onUpdate(),
      this.teamService.onCreated(),
      this.teamService.onJoin(),
      this.teamService.onDelete(),
    ).subscribe((d) => {
      this.submitSearch()
    });

    this.connectionSubscription = merge(
      this.socketService.onDisconnected(),
      this.socketService.onConnected(),
    ).subscribe((d: IConnectionEventData | IDisconnectionEventData) => {
      if (d) {
        const index = this.teams.findIndex((t) => t.teamId === d.roomId);
        if (index > -1) {
          this.teams[index].onlineMemberCount = d.onlineMemberCount;
        }
      }
    });

    this.deleteFinishedSubscription = this.teamService.onDeleteFinished().subscribe((d) => {
      this.isLoading = false;
      this.snackBar.open('Super! Équipe supprimée!', "OK", { duration: 5000 });
    });

    this.leaveFinishedSubscription = this.teamService.onLeaveFinished().subscribe((data) => {
      this.leaveLoading = false;
      this.snackBar.open(`Succès! Vous avez quitté l'équipe "${data.teamName}!"`, 'OK', { duration: 5000 });
      this.submitSearch();
    });

    this.joinFinishedSubscription = this.teamService.onJoinFinished().subscribe((d) => {
      this.currentLoadingIndex = null;
      this.snackBar.open(`Super! Vous avez rejoint l'équipe "${this.activeTeamName}"!`, 'OK', { duration: 5000 });
      this.activeTeamName = "";
    });

    this.exceptionSubscription = merge(
      this.teamService.onDeleteException(),
      this.teamService.onJoinException(),
      this.teamService.onLeaveException(),
    ).subscribe((data) => {
      this.snackBar.open(data.message, "OK", { duration: 5000 });
    });

    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = "Équipes par page: ";
    this.paginator._intl.nextPageLabel = "Page suivante";
    this.paginator._intl.lastPageLabel = "Dernière page";
    this.paginator._intl.previousPageLabel = "Page précédente";
    this.paginator._intl.firstPageLabel = "Première page";
  }

  get query(): AbstractControl {
    return this.searchForm.get('query')!
  }

  get type(): AbstractControl {
    return this.searchForm.get('type')!
  }

  onJoin(team: TeamResponse, index: number): void {
    if (this.currentLoadingIndex === index) {
      return;
    }

    if (team.type === TeamType.Protected) {
      this.currentLoadingIndex = index;

      this.dialog.open(TeamPasswordDialogComponent, { width: '500px', data: team }).afterClosed().subscribe(() => {
        this.currentLoadingIndex = null;
      });

    } else {
      this.activeTeamName = team.teamName;
      this.currentLoadingIndex = index;
      this.teamService.sendJoin({ userId: this.auth.activeUser!.uid, teamId: team.teamId });
    }
  }

  openCreateTeamDialog(): void {
    this.dialog.open(CreateTeamDialogComponent, this.dialogOptions);
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
    }, () => {
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

    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }

    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }

    if (this.leaveFinishedSubscription) {
      this.leaveFinishedSubscription.unsubscribe();
    }

    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }

    if (this.deleteFinishedSubscription) {
      this.deleteFinishedSubscription.unsubscribe();
    }
  }

  leaveTeam(team: TeamResponse): void {
    this.teamService.sendLeave({ teamId: team.teamId });
  }

  deleteTeam(team: TeamResponse): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      data: {
        message: `Êtes vous sûr de vouloir supprimer l'équipe "${team.teamName}" ?`,
        submessage: `Cette action est irréversible et supprimera tous les dessins créés par l'équipe.`
      }
    }).afterClosed().subscribe((d) => {
      if (d) {
        this.teamService.sendDelete({ teamId: team.teamId });
      }
    });
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
