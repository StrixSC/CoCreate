import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/chat/socket.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  types = [
    { key: 'Protected', value: 'Protégé' },
    { key: 'Public', value: 'Public' }
  ];

  mascots = [
    { key: '', value: 'Choisir pour moi!' },
    { key: 'tiger', value: 'Tigre' },
    { key: 'lion', value: 'Lion' },
    { key: 'elephant', value: 'Éléphant' },
    { key: 'walrus', value: 'Morse' },
    { key: 'gorilla', value: 'Gorille' },
    { key: 'cobra', value: 'Cobra' },
    { key: 'zebra', value: 'Zebre' },
    { key: 'horse', value: 'Cheval' },
    { key: 'eagle', value: 'Aigle' }
  ];

  constructor(private http: HttpClient, private socketService: SocketService) { }

  fetchTeams(query: string) {
    return this.http.get(environment.serverURL + '/api/teams' + query);
  }

  fetchTeamById(teamId: string) {
    return this.http.get(environment.serverURL + '/api/teams/' + teamId);
  }

  sendJoin(data: any): void {
    this.socketService.emit('teams:join', data);
  }

  sendLeave(data: any): void {
    this.socketService.emit('teams:leave', data);
  }

  sendCreateTeam(data: any): void {
    this.socketService.emit('teams:create', data);
  }

  sendUpdate(data: any): void {
    this.socketService.emit('teams:update', data);
  }

  onUpdateException(): Observable<any> {
    return this.socketService.on('teams:update:exception');
  }

  onUpdateFinished(): Observable<any> {
    return this.socketService.on('teams:update:finished');
  }

  onUpdated(): Observable<any> {
    return this.socketService.on('teams:updated');
  }

  onCreated(): Observable<any> {
    return this.socketService.on('teams:created');
  }

  onJoin(): Observable<any> {
    return this.socketService.on('teams:joined');
  }

  onJoinFinished(): Observable<any> {
    return this.socketService.on('teams:join:finished');
  }

  onCreationFinished(): Observable<any> {
    return this.socketService.on('teams:create:finished');
  }

  onJoinException(): Observable<any> {
    return this.socketService.on('teams:join:exception');
  }

  onCreationException(): Observable<any> {
    return this.socketService.on('teams:create:exception');
  }

  onLeaveException(): Observable<any> {
    return this.socketService.on('teams:leave:exception');
  }

  onLeaveFinished(): Observable<any> {
    return this.socketService.on('teams:leave:finished');
  }

  onLeave(): Observable<any> {
    return this.socketService.on('teams:left');
  }

  onDeleteException() {
    return this.socketService.on('teams:delete:exception');
  }

  onDeleteFinished() {
    return this.socketService.on('teams:delete:finished');
  }

  onDelete() {
    return this.socketService.on('teams:deleted');
  }

  onUpdate() {
    return this.socketService.on('teams:updated');
  }

  onException() {
    return this.socketService.on('teams:exception');
  }
}
