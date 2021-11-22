import { IGalleryEntry,IConnectCollaboration,ICreateCollaboration,IDeleteCollaboration,IJoinCollaboration,
    ILeaveCollaboration,IUpdateCollaboration
} from "../model/IGalleryEntry.model";
import { Observable, of, EMPTY } from "rxjs";
import { Injectable } from "@angular/core";
import { SocketService } from "./chat/socket.service";

@Injectable({
  providedIn: "root",
})
export class SyncCollaborationService {
  defaultPayload: IGalleryEntry | null;

  constructor(
    private socketService: SocketService
  ) {
    this.defaultPayload = null;
  }


  onCreateCollaboration(): Observable<ICreateCollaboration> {
    return this.socketService.on("collaboration:created");
  }
  onJoinCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:joined");
  }
  onLeaveCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:left");
  }
  onDeleteCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:deleted");
  }
  onConnectCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:connected");
  }
  onLoadCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:load");
  }
  onUpdateCollaboration(): Observable<any> {
    return this.socketService.on("collaboration:updated");
  }

  sendJoin(userId: string, collaborationId: string, type: string, password?:string){
      let data :IJoinCollaboration = {
        userId,collaborationId,type
      }
      this.socketService.emit('collaboration:join', data );
  }

  sendConnect (userId: string, collaborationId: string)
  {
    let data: IConnectCollaboration;
    data = { userId:'jsu', collaborationId:'Public'};
    this.socketService.emit('collaboration:connect', data );   
  }

  sendCreateCollaboration(
    userID: string,
	title: string,
	type: string,
    password?: string,
  ): void {
    let data: ICreateCollaboration;
    if (type==="Protected"){
      data  = {
        userId : userID,
        title: title,
        type: type,
        password: password,}
          
    }
    else {
    data = {
        userId: userID,
        title: title,
        type: type}
          
    }
    console.log(data)
    
    this.socketService.emit('collaboration:create', data );
  }

  sendUpdateCollaboration(userId: string,
	collaborationId: string,
	title: string,
	type: string, 		
	password?: string
) {
    this.socketService.emit('collaboration:update', {collaborationId,title,type});
  }

  sendDeleteCollaboration(userId: string, collaborationId: string) {
    this.socketService.emit('collaboration:delete', {userId, collaborationId});
  }

  sendLeaveCollaboration(data: { userId: string, collaborationId: string}) {
    this.socketService.emit('collaboration:leave', data);
  }
  
}
