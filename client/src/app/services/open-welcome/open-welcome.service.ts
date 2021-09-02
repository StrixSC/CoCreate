import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { NewDrawingComponent } from 'src/app/components/new-drawing/new-drawing.component';
import { WelcomeDialogComponent } from 'src/app/components/welcome-dialog/welcome-dialog/welcome-dialog.component';
import { WelcomeDialogService } from '../welcome-dialog/welcome-dialog.service';

const MAX_HEIGHT_WELCOME_DIALOG = 500;
const MAX_WIDTH_WELCOME_DIALOG = 500;

/// Service qui ouvre la page de démarage a l'ouverture de polydessin
@Injectable({
  providedIn: 'root',
})
export class OpenWelcomeService {

  welcomeDialogRef: MatDialogRef<WelcomeDialogComponent>;
  welcomeDialogSub: Subscription;

  constructor(public dialog: MatDialog, private welcomeService: WelcomeDialogService) { }

  /// Permet d'ouvrir le dialogue avec les pbons paramêtres
  openDialog(): void {
    this.welcomeDialogRef = this.dialog.open(WelcomeDialogComponent, {
      hasBackdrop: true,
      panelClass: 'filter-popup',
      autoFocus: false,
      disableClose: true,
      maxHeight: MAX_HEIGHT_WELCOME_DIALOG,
      maxWidth: MAX_WIDTH_WELCOME_DIALOG,
    });

  }

  // Ouvre le mat dialog lorsque le browser est initialiser si le checkbox est non cocher
  openOnStart(): void {
    if (this.welcomeService.messageActivated.value) {
      this.openDialog();
      this.welcomeDialogSub = this.welcomeDialogRef.afterClosed().subscribe(() => {
        this.dialog.open(NewDrawingComponent);
      });
    }
  }
}
