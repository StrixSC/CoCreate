import { SyncDrawingService } from './../../services/syncdrawing.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { CollaborationService } from 'src/app/services/collaboration.service';
import { mergeMap, take } from 'rxjs/operators';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { ExportDialogService } from 'src/app/services/export-dialog/export-dialog.service';
import { OpenDrawingDialogService } from 'src/app/services/open-drawing-dialog/open-drawing-dialog.service';
import { SaveDrawingDialogService } from 'src/app/services/save-drawing-dialog/save-drawing-dialog.service';
import { NewDrawingComponent } from '../../components/new-drawing/new-drawing.component';
import { HelpDialogComponent } from '../welcome-dialog/help-dialog/help-dialog.component';
import { DIALOG_PROPERTIES, WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';
import { AuthService } from './../../services/auth.service';
import { HotkeysEmitterService } from 'src/app/services/hotkeys/hotkeys-emitter/hotkeys-emitter.service';
import { EmitReturn } from '../../services/hotkeys/hotkeys-constants';
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
    private hotkeysService: HotkeysEmitterService,
    private drawingService: DrawingService,
    private saveDrawingDialogService: SaveDrawingDialogService,
    private commandInvoker: CommandInvokerService,
    private exportDialogService: ExportDialogService,
    private openDrawingService: OpenDrawingDialogService,
    private authService: AuthService,
    private collaborationService: CollaborationService,
    private selectionService: SelectionToolService,
    private syncService: SyncDrawingService,
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
  openDrawingGallery(): void {
    this.router.navigateByUrl('gallery');
  }

  get canUndo(): boolean {
    return this.collaborationService.canUndo();
  }

  get canRedo(): boolean {
    return this.collaborationService.canRedo();
  }
  /// Undo
  undo(): void {
    if (this.canUndo) {
      this.selectionService.sendUnselect();
      let undoAction = this.collaborationService.undoUserAction();
      if (undoAction && undoAction.isSelected && undoAction.selectedBy === this.syncService.defaultPayload!.userId) {
        this.selectionService.sendUnselect(undoAction.command.actionId);
      }
    }
  }

  /// Redo
  redo(): void {
    if (this.canRedo) {
      this.selectionService.sendUnselect();
      let redoAction = this.collaborationService.redoUserAction();
      if (redoAction && redoAction.isSelected && redoAction.selectedBy === this.syncService.defaultPayload!.userId) {
        this.selectionService.sendUnselect(redoAction.command.actionId);
      }
    }
  }

  openProfile(): void {
    this.router.navigate(['/profile-settings'])
  }

  signOut(): void {
    this.authService.logUserDisconnection()
      .pipe(
        mergeMap(() => from(this.authService.signOut())),
        take(1)
      ).subscribe((d: any) => {
        console.log('Sign out successful!');
      });
  }

  getActions(): void {
    console.log(this.collaborationService['actions']);
    console.log(this.collaborationService['undos'], this.collaborationService['redos']);
  }

  ngOnDestroy(): void {
    if (this.signOutSubscription) {
      this.signOutSubscription.unsubscribe();
    }
  }

}
