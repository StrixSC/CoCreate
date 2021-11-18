import { environment } from 'src/environments/environment';
import { SyncDrawingService } from '../../services/syncdrawing.service';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from './../../services/chat/socket.service';
import { ActionType } from 'src/app/model/IAction.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Colorimage';
  authSubscription: Subscription;
  constructor(private router: Router, private socketService: SocketService, private af: AngularFireAuth, private syncDrawing: SyncDrawingService) {
    if (environment.useEmulator) {
      this.af.auth.useEmulator(environment.authEmulator)
    }
    this.authSubscription = this.af.authState.subscribe((state) => {
      if (!state) {
        this.router.navigateByUrl('');
        this.socketService.disconnect();
      } else {
        this.syncDrawing.defaultPayload = {
          collaborationId: 'DEMO_COLLABORATION',
          userId: state.uid,
          username: state.displayName || 'demo',
          actionId: '',
          actionType: ActionType.Freedraw
        }
        console.log(this.syncDrawing.defaultPayload);
        this.socketService.setupSocketConnection();
      }
    });
  }

}
