import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { User } from 'firebase';
import { LongDateFormatSpec } from 'moment';
//import * as firebase from 'firebase';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

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
export class UserProfileComponent  implements OnInit{
  displayedColumns: string[] = ['type', 'date'] // for the table in the html
  private username="username";
  private user: firebase.User;
  private userId:String;
  private afSubscription: Subscription;
  private logs:[];
  private editLogs:[10000]

  constructor(private httpClient:HttpClient, private route:ActivatedRoute,private af: AngularFireAuth) {
    
   }

  async ngOnInit(): Promise<void>  {
  
      this.httpClient.get(environment.serverURL+'/api/users/profile/' + this.route.snapshot.params.id).subscribe( (res) => {
        return this.username=res['username']
      })
      this.afSubscription = this.af.authState.subscribe(user => {
        if(user)
        this.user = user;
      });

      //hardcoded the uid for now
      this.httpClient.get(environment.serverURL+'/api/users/D0B7022GbfVheSG9gmZZ4gQJnGi2' + '/logs').subscribe( (res) => {
        const logs:[] = <any>res
        console.log(res)
        this.logs=logs
        for(let i=0;i<logs.length;i++){
          if (logs[i]['drawing_id']){
            this.editLogs[i]=logs[i]
          }
        }
      })

   console.log(this.logs)
   console.log(this.editLogs)
  }

  
    


}


