import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient:HttpClient) { }
  getLogs(): Observable<any> { 
    return this.httpClient.get(environment.serverURL+"/api/users/logs");
  }
  updateProfile(profileUpdateBody:any):Observable<any> {
    return this.httpClient.put<any>(environment.serverURL+"/api/users/profile",profileUpdateBody)
  }
}
