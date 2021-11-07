import { catchError, concatMap, mergeMap, map, flatMap } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, from, of, EMPTY } from "rxjs";
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap } from 'rxjs/operators';

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
    return this.http.post(environment.serverURL + '/auth/register', {
      payload
    })
  }

  signOut(): Observable<any> {
    return from(this.af.auth.signOut());
  }

  logUserDisconnection() {
    return this.http.get(environment.serverURL + '/auth/logout');
  }

}
