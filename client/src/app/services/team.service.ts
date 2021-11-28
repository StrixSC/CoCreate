import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/chat/socket.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private http: HttpClient, private socketService: SocketService) { }

  fetchTeams(query: string) {
    return this.http.get(environment.serverURL + '/api/teams' + query);
  }

  sendCreateTeam(data: any): void {
    this.socketService.emit('teams:create', data);
  }

  onCreated(): Observable<any> {
    return this.socketService.on('teams:created');
  }

  onCreationFinished(): Observable<any> {
    return this.socketService.on('teams:create:finished');
  }

  onCreationException(): Observable<any> {
    return this.socketService.on('teams:create:exception');
  }
}
