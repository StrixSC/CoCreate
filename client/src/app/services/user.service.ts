import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth/auth';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private username:String
  private userId:String
  constructor(private httpClient:HttpClient) {
   console.log(this.username)
  }
  getLogs(): Observable<any> { 
    return this.httpClient.get(environment.serverURL+"/api/users/logs");
  }
  updateUsernameAndAvatar(username:string,avatarUrl:string):Observable<any> {
    let updateBody = {
      "username":username,
      "avatarUrl":avatarUrl,
    }
    return this.httpClient.put<any>(environment.serverURL+"/api/users/profile/",updateBody)
  }
  getPublicProfile():Observable<any> {
    return this.httpClient.get(environment.serverURL+"/api/users/profile/"+this.username)
  }
  updatePassword(newPasswordBody:any):Observable<any> {
    return this.httpClient.put<any>(environment.serverURL+"/auth/update/password",newPasswordBody)
  }
  uploadAvatar(avatarUrl:string):Observable<any>{
    let avatarUploadBody={"avatar":avatarUrl} 
    return this.httpClient.post<any>(environment.serverURL+"/api/users/upload/avatar",avatarUploadBody);
  }
  
}
