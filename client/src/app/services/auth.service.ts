import { SocketService } from 'src/app/services/chat/socket.service';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, from, BehaviorSubject } from "rxjs";
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

@Injectable({
  providedIn: "root",
})
export class AuthService {

  activeUser: firebase.User | null = null;
  constructor(private af: AngularFireAuth, private http: HttpClient, private socketService: SocketService) { }

  signIn(user: { email: string, password: string }): Observable<firebase.auth.UserCredential> {
    return from(this.af.auth.signInWithEmailAndPassword(user.email, user.password));
  }

  get authState(): Observable<any> {
    return this.af.authState;
  }

  logUserConnection() {
    return this.http.get(environment.serverURL + '/auth/login');
  }

  register(fd: FormData): Observable<any> {
    return this.http.post(environment.serverURL + '/auth/register', fd);
  }

  signOut(): Observable<any> {
    if (this.socketService.socket) {
      this.socketService.disconnect();
    }
    return from(this.af.auth.signOut());
  }

  logUserDisconnection() {
    return this.http.get(environment.serverURL + '/auth/logout');
  }

  getPublicAvatars(): Observable<any> {
    return this.http.get(environment.serverURL + '/api/public/avatars');
  }
}
