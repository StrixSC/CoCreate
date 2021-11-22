import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase';
import { LongDateFormatSpec } from 'moment';
//import * as firebase from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

import { environment } from 'src/environments/environment';

  export interface Profile {
      username: string;
      avatar_url: string;
  }

  export interface Account {
      first_name: string;
      last_name: string;
  }

  export interface Stats {
      collaboration_count: string;
      authorCount: number;
      active_team_count: string;
      average_collaboration_time: string;
      total_collaboration_time: string;
  }

  export interface Log {
      type: string;
      created_at: string;
      drawing_id: string;
  }

  export interface PersonalUser {
      profile: Profile;
      account: Account;
      stats: Stats;
      logs: Log[];
      email: string;
      user_id: string;
      
  }

  export interface PublicUser {
    username: string;
    avatarUrl: string;
  }


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent  implements OnInit, OnDestroy{
  displayedColumns: string[] = ['type', 'date'] // for the table in the html
  private username="";
  private logs: Log[] = [];
  private editLogs: Log[] = [];
  private logsSubscription: Subscription;
  private loading: boolean = false;
  constructor(private httpClient:HttpClient, private route:ActivatedRoute,private af: AngularFireAuth, private userService:UserService) {
    
   }

  ngOnInit(): void  {
      this.loading = true;
      this.username = this.route.snapshot.params.id;
      if(!this.username) {
        // redirect 404;
      }
      this.userService.getLogs(this.username).subscribe((logs: Log[]) => {
        this.logs = logs;
        this.loading = false;
        this.editLogs = logs.filter((l) => l.drawing_id);
    });
  

  }

  ngOnDestroy(): void {
    if(this.logsSubscription) {
      this.logsSubscription.unsubscribe();
    }
  }
}


