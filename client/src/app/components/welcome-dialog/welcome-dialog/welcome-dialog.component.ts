import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { WelcomeDialogService } from 'src/app/services/welcome-dialog/welcome-dialog.service';
import { WelcomeMessage } from '../../../../../../common/communication/message';
import { IndexService } from '../../../services/index/index.service';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';

export const DIALOG_PROPERTIES = {
  hasBackdrop: true,
  panelClass: 'filter-popup',
  autoFocus: false,
  disableClose: true,
  maxHeight: 500,
  maxWidth: 500,
};

@Component({
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
  styleUrls: ['./welcome-dialog.component.scss'],
})
export class WelcomeDialogComponent implements OnInit {
  welcomeMessage = new BehaviorSubject<WelcomeMessage>({ body: '', end: '' });
  form: FormGroup;
  constructor(
    public dialog: MatDialog,
    private welcomeService: WelcomeDialogService,
    public dialogRef: MatDialogRef<WelcomeDialogComponent>,
    private basicService: IndexService,
  ) {
    /// recevoir text de bienvenue de index service grace a la fonction welcomeGet qui va chercher le JSON file text du cote du serveur
    this.basicService.welcomeGet()
      .subscribe(this.welcomeMessage);
  }

  /// Fonction pour ouvrir le dialogue d'aide
  openDialog() {
    this.dialog.open(HelpDialogComponent, {
      hasBackdrop: true,
      autoFocus: false,
      disableClose: true,
      minWidth: 750,
      maxWidth: 750,
      maxHeight: 600,
    });
  }
  ngOnInit(): void {
    this.form = this.welcomeService.form;
  }
  /// fonction closeClick qui permet de fermer le premier mat dialog du message de bienvenue
  closeClick(): void {
    this.dialogRef.close();
  }
}
