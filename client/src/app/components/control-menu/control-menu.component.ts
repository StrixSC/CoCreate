import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { from, Subscription } from 'rxjs';
import { mergeMap, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { ExportDialogService } from 'src/app/services/export-dialog/export-dialog.service';
import { OpenDrawingDialogService } from 'src/app/services/open-drawing-dialog/open-drawing-dialog.service';
import { SaveDrawingDialogService } from 'src/app/services/save-drawing-dialog/save-drawing-dialog.service';
import { NewDrawingComponent } from '../../components/new-drawing/new-drawing.component';
import { HelpDialogComponent } from '../welcome-dialog/help-dialog/help-dialog.component';
import { DIALOG_PROPERTIES, WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { AuthService } from './../../services/auth.service';

/// Component pour afficher les options fichiers
@Component({
  selector: 'app-control-menu',
  templateUrl: './control-menu.component.html',
  styleUrls: ['./control-menu.component.scss'],
})
export class ControlMenuComponent implements OnDestroy {

  signOutSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private drawingService: DrawingService,
    private saveDrawingDialogService: SaveDrawingDialogService,
    private commandInvoker: CommandInvokerService,
    private exportDialogService: ExportDialogService,
    private openDrawingService: OpenDrawingDialogService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  get isSaved(): boolean {
    return this.drawingService.isSaved;
  }
  get isCreated(): boolean {
    return this.drawingService.isCreated;
  }

  /// Ouvre une nouveau dialog de creation de dessin
  openNewDrawing(): void {
    this.dialog.open(NewDrawingComponent, {});
  }

  /// Ouvre le message d'aide
  openHelp(): void {
    this.dialog.open(HelpDialogComponent, {
      hasBackdrop: true,
      autoFocus: false,
      disableClose: true,
      minWidth: 750,
      maxWidth: 750,
      maxHeight: 600,
    });
  }

  /// Ouvre le message de bienvenue
  openWelcomeMessage(): void {
    this.dialog.open(WelcomeDialogComponent, DIALOG_PROPERTIES);
  }

  openDrawingGallery() : void {
    this.router.navigateByUrl("gallery")
  }

  /// Ouvrir le dialog de sauvegarde de dessin
  openSaveDrawing(): void {
    this.saveDrawingDialogService.openDialog();
  }

  /// Ouvrir le dialog d'ouverture de fichier
  openOpenDrawing(): void {
    this.openDrawingService.openDialog();
  }
  openExportMenu(): void {
    this.exportDialogService.openDialog();
  }

  get canUndo(): boolean {
    return this.commandInvoker.canUndo;
  }

  get canRedo(): boolean {
    return this.commandInvoker.canRedo;
  }

  /// Undo
  undo(): void {
    this.commandInvoker.undo();
  }

  /// Redo
  redo(): void {
    this.commandInvoker.redo();
  }

  signOut(): void {
    this.authService.logUserDisconnection()
    .pipe(
      mergeMap(() => from(this.authService.signOut())), 
      take(1)
    ).subscribe((d) => {
      console.log('Sign out successful!');
    });
  }

  ngOnDestroy(): void {
    if (this.signOutSubscription) {
      this.signOutSubscription.unsubscribe();
    }
  }

}
