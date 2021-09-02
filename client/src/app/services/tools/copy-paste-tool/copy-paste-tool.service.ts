import { Injectable } from '@angular/core';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { DeletingToolService } from '../selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from '../selection-tool/selection-tool.service';
import { CopyPasteOffsetService } from './copy-paste-offset.service';
import { PasteDuplicateCommand } from './paste-duplicate-command';

/// Service permettant les fonctions de press-papier
@Injectable({
  providedIn: 'root',
})
export class CopyPasteToolService {
  private pasteDuplicateCommand: PasteDuplicateCommand;
  private clipboardList: SVGElement[] = [];
  private cloneList: SVGElement[] = [];

  constructor(
    private selectionTool: SelectionToolService,
    private deletingTool: DeletingToolService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
    private commandInvoker: CommandInvokerService,
    private copyPasteOffsetService: CopyPasteOffsetService,
  ) { }

  /// Copie d'un objet
  copy(): void {
    this.copyCut();
    this.copyPasteOffsetService.resetToConstPasteOffset();
  }

  /// Couper d'un objet
  cut(): void {
    this.copyCut();
    this.copyPasteOffsetService.resetPasteOffset();
    this.deletingTool.deleteSelection();
  }

  /// Coller un objet
  paste(): void {
    if (this.clipboardList.length > 0) {
      this.cloneList = [];
      this.clipboardList.forEach((obj) => {
        this.cloneList.push(obj.cloneNode(true) as SVGElement);
      });

      this.createAndExecuteCommand(true);
      this.copyPasteOffsetService.changePasteOffset();
    }
  }

  /// Dupliquer un objet
  duplicate(): void {
    this.copyPasteOffsetService.offsetInit = this.selectionTool.getRectSelectionOffset();

    this.cloneList = [];
    this.selectionTool.getObjectList().forEach((obj) => {
      const clone: SVGElement = obj.cloneNode(true) as SVGElement;
      clone.removeAttribute('id');
      this.cloneList.push(clone);
    });

    this.createAndExecuteCommand(false);
  }

  /// Verification si le presse-papier est vide
  hasClipboardObject(): boolean {
    return this.clipboardList.length > 0;
  }

  /// Fonction ayant la logique de la copie
  private copyCut(): void {
    this.copyPasteOffsetService.offsetInit = this.selectionTool.getRectSelectionOffset();

    if (this.selectionTool.getObjectList().length > 0) {
      this.clipboardList = [];
    }
    this.selectionTool.getObjectList().forEach((obj) => {
      const clone: SVGElement = obj.cloneNode(true) as SVGElement;
      clone.removeAttribute('id');
      this.clipboardList.push(clone);
    });
  }

  /// Creation de la commande pour pouvoir effectuer les fonctionnalité
  private createAndExecuteCommand(isPaste: boolean): void {
    const pasteDuplicateCommand = new PasteDuplicateCommand(
      this.rendererService.renderer,
      this.drawingService,
      this.copyPasteOffsetService,
      this.cloneList,
      isPaste,
    );

    this.pasteDuplicateCommand = pasteDuplicateCommand;

    this.commandInvoker.executeCommand(this.pasteDuplicateCommand);
    this.selectionTool.setNewSelection(pasteDuplicateCommand.getObjectList());
  }
}
