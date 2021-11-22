import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient:HttpClient) { }
  getLogs(username:string): Observable<any> {
    return this.httpClient.get(environment.serverURL+`/api/users/${username}` + '/logs');
  }
}
