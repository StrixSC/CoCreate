import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth/auth';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  getLogs(): Observable<any> {
    return this.http.get(environment.serverURL + "/api/users/logs");
  }

  updateUsernameAndAvatar(username: string, avatarUrl: string): Observable<any> {
    let updateBody = {
      "username": username,
      "avatarUrl": avatarUrl,
    }
    return this.http.put<any>(environment.serverURL + "/api/users/profile/", updateBody)
  }

  getPublicProfile(username: string): Observable<any> {
    return this.http.get(environment.serverURL + `/api/users/profile/${username}`);
  }

  toggleConfidentiality(data: any): Observable<any> {
    return this.http.put(environment.serverURL + '/api/users/account/confidentiality', data);
  }

  updatePassword(data: any): Observable<any> {
    return this.http.put<any>(environment.serverURL + "/auth/update/password", data)
  }

  uploadAvatar(formData: FormData): Observable<any> {
    return this.http.post<any>(environment.serverURL + "/api/users/upload/avatar", formData);
  }

  fetchUserInformation() {
    return this.http.get(environment.serverURL + "/api/users/account");
  }
}
