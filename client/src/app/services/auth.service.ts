import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private af: AngularFireAuth, private http: HttpClient) { }

  signIn(user: { email: string, password: string }): Observable<any> {
      return from(this.af.auth.signInWithEmailAndPassword(user.email, user.password));
    }
    
  logUserConnection() {
      return this.http.get(environment.serverURL + '/auth/login');
  }

  register(payload: any): Observable<any> {
    return this.http.post(environment.serverURL + '/auth/register', JSON.stringify(payload), {
      headers: {
        'Content-Type': "application/json"
      }
    });
  }

  signOut(): Observable<any> {
    return from(this.af.auth.signOut());
  }

  logUserDisconnection() {
    return this.http.get(environment.serverURL + '/auth/logout');
  }

}
