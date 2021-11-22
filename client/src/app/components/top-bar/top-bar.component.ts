import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { EMPTY, merge, of, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { SocketService } from 'src/app/services/chat/socket.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  messageListener: Subscription;

  private user: firebase.User;
  private afSubscription: Subscription;
  constructor(private syncCollaboration: SyncCollaborationService, private socketService: SocketService,
    private af: AngularFireAuth) { }

  ngOnInit() {
    this.afSubscription = this.af.authState.subscribe(user => {
      if(user !== null){
      this.user = user;
      console.log(this.user.uid);
      
    //this.syncCollaboration.sendJoin(this.user.uid,'DEMO_COLLABORATION','Public');
    this.syncCollaboration.sendConnect(this.user.uid, 'DEMO_COLLABORATION');
      }
    });
    console.log(this.user.uid)
    this.messageListener = this.socketService.socketReadyEmitter
      .pipe(
        take(1),
        switchMap((ready: boolean) => {
          if (ready) {
            return merge(
              this.syncCollaboration.onJoinCollaboration(),
              this.syncCollaboration.onConnectCollaboration(),
              this.syncCollaboration.onCreateCollaboration(),
              this.syncCollaboration.onDeleteCollaboration(),
              this.syncCollaboration.onJoinCollaboration(),
              this.syncCollaboration.onUpdateCollaboration(),
              this.syncCollaboration.onLoadCollaboration()
            )
          } else {
            console.log("hey 2")
            return of(EMPTY);
          }
        })
      ).subscribe((data: any) => {
        console.log('Event received');
        console.log(data)
      })
      console.log("hey")
    
  }
  ngAfterViewInit(){

  }
  ngOnChanges(){
    this.listenJoin();
  }
  ngOnDestroy(){
    if(this.messageListener) { this.messageListener.unsubscribe();}
    if(this.afSubscription) {
      this.afSubscription.unsubscribe();
    }

  }


  public listenJoin(){
  this.syncCollaboration
      .onJoinCollaboration()
      .subscribe((data) => {
        console.log(data);    
      });
  }

  public updateCollaboration(paramChoice: string){
      //this.syncCollaboration.sendUpdateCollaboration(paramChoice)

  }

}
