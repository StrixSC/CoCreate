import { Router } from '@angular/router';
import { SocketService } from './../../services/chat/socket.service';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HotkeysService } from 'src/app/services/hotkeys/hotkeys.service';
import { NewDrawingComponent } from '../new-drawing/new-drawing.component';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-drawing-page',
  styleUrls: ['./drawing-page.component.scss'],
  templateUrl: './drawing-page.component.html',
})
export class DrawingPageComponent implements OnDestroy {

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;
  errorSubscription: Subscription;
  exceptionSubscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private hotkeyService: HotkeysService,
    private socketService: SocketService,
    private router: Router
  ) {
    this.hotkeyService.hotkeysListener();
  }
  
  async ngOnInit() {
   
  }
  // Fonction qui ouvre le mat Dialog de bienvenue
  openDialog() {
    this.welcomeDialogRef = this.dialog.open(WelcomeDialogComponent, {
      hasBackdrop: true,
      panelClass: 'filter-popup',
      autoFocus: false,
      disableClose: true,
      maxHeight: 500,
      maxWidth: 500,
    });
    this.welcomeDialogSub = this.welcomeDialogRef.afterClosed().subscribe(() => {
      this.dialog.open(NewDrawingComponent);
    });
  }

  ngOnDestroy(): void {
    if (this.welcomeDialogSub) {
      this.welcomeDialogSub.unsubscribe();
    }

    if(this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }

    if(this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }
  }
}
