import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { ExportDialogService } from 'src/app/services/export-dialog/export-dialog.service';
import { OpenDrawingDialogService } from 'src/app/services/open-drawing-dialog/open-drawing-dialog.service';
import { SaveDrawingDialogService } from 'src/app/services/save-drawing-dialog/save-drawing-dialog.service';
import { NewDrawingComponent } from '../../components/new-drawing/new-drawing.component';
import { HelpDialogComponent } from '../welcome-dialog/help-dialog/help-dialog.component';
import { DIALOG_PROPERTIES, WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog/welcome-dialog.component';

/// Component pour afficher les options fichiers
@Component({
  selector: 'app-control-menu',
  templateUrl: './control-menu.component.html',
  styleUrls: ['./control-menu.component.scss'],
})
export class ControlMenuComponent {

  constructor(
    private dialog: MatDialog,
    private drawingService: DrawingService,
    private saveDrawingDialogService: SaveDrawingDialogService,
    private commandInvoker: CommandInvokerService,
    private exportDialogService: ExportDialogService,
    private openDrawingService: OpenDrawingDialogService,
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
}
