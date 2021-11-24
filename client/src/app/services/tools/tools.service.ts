import { SyncDrawingService } from './../syncdrawing.service';
import { Injectable } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { CommandInvokerService } from 'src/app/services/command-invoker/command-invoker.service';
import { Tools } from '../../interfaces/tools.interface';
import { DrawingService } from '../drawing/drawing.service';
import { PencilToolService } from './pencil-tool/pencil-tool.service';
import { SelectionToolService, ActionButtonIds } from './selection-tool/selection-tool.service';
import { TextToolService } from './text-tool/text-tool.service';
import { ToolEllipseService } from './tool-ellipse/tool-ellipse.service';
import { ToolIdConstants } from './tool-id-constants';
import { ToolRectangleService } from './tool-rectangle/tool-rectangle.service';

/// Service permettant de gérer l'outil présent selon son ID
/// Appelle les bonnes fonctions d'évenement souris selon l'outil selectionner

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private isPressed = false;
  selectedToolId = 0;
  tools: Map<number, Tools> = new Map<number, Tools>();

  constructor(
    private drawingService: DrawingService,
    private pencilTool: PencilToolService,
    private rectangleTool: ToolRectangleService,
    private ellipseTool: ToolEllipseService,
    private selectionTool: SelectionToolService,
    private textTool: TextToolService,
    private syncService: SyncDrawingService,

    private commandInvoker: CommandInvokerService,
  ) {
    this.initTools();
    this.onKeyTriggered();
  }

  /// Initialiser la liste d'outil
  private initTools(): void {
    this.tools.set(this.pencilTool.id, this.pencilTool);
    this.tools.set(this.rectangleTool.id, this.rectangleTool);
    this.tools.set(this.ellipseTool.id, this.ellipseTool);
    this.tools.set(this.selectionTool.id, this.selectionTool);
    this.tools.set(this.textTool.id, this.textTool);
  }

  /// Selectionner un outil avec son id
  selectTool(id: number): void {
    // appliquer les changements sur l'outil precedent
    const oldTool = this.selectedTool;
    if (oldTool) {
      oldTool.dropTool();
    }
    // selectionner le nouvel outil
    this.selectedToolId = id;

    const newTool = this.selectedTool;
    if (newTool) {
      newTool.pickupTool();
    }
  }

  /// Retourner l'outil presentement selectionné
  get selectedTool(): Tools | undefined {
    return this.tools.get(this.selectedToolId);
  }

  /// Appeller la fonction onPressed du bon outil et ajoute un objet au dessin si nécéssaire
  onPressed(event: MouseEvent): void {
    if (this.drawingService.isCreated) {
      const tool = this.selectedTool;
      if (!tool) {
        return;
      }

      if (tool.id !== ToolIdConstants.SELECTION_ID) {
        this.selectionTool.removeSelection();
      }

      tool.onPressed(event);
      this.isPressed = true;
    }
  }

  /// Appelle la fonction onRelease du bon outil et annule les entrée d'évenement souris
  onRelease(event: MouseEvent): void {
    if (this.drawingService.isCreated) {
      const tool = this.selectedTool;
      if (!tool) {
        return;
      }
      if (this.isPressed || tool.id === ToolIdConstants.LINE_ID) {
        const command: ICommand | void = tool.onRelease(event);
        if (command) {
          command.actionId = this.syncService.activeActionId;
          this.commandInvoker.addCommand(command);
        }
      }
      this.isPressed = false;
    }
  }

  /// Appelle la fonction onMove du bon outil si les entrée d'évenement souris son activé
  onMove(event: MouseEvent): void {
    if (this.drawingService.isCreated) {
      const tool = this.selectedTool;
      if (!tool) {
        return;
      }

      if (event.target instanceof SVGImageElement || event.target instanceof SVGCircleElement) {
        const id = (event.target as SVGElement).getAttribute('iconId');
        if (id && Object.values(ActionButtonIds).map((c) => c.toString()).includes(id) && tool.id === ToolIdConstants.SELECTION_ID) {
          (tool as SelectionToolService).hoverActionButton(id);
        }
      } else {
        if (tool.id === ToolIdConstants.SELECTION_ID) {
          (tool as SelectionToolService).unhoverActionButton();
        }
      }

      if (this.isPressed || tool.id === ToolIdConstants.LINE_ID || tool.id === ToolIdConstants.ERASER_ID) {
        tool.onMove(event);
      }
    }
  }

  onKeyTriggered(): void {

    window.addEventListener('keydown', (event) => {
      if (this.drawingService.isCreated) {
        const tool = this.selectedTool;
        if (!tool) {
          return;
        }
        if (this.isPressed || tool.id === ToolIdConstants.LINE_ID
          || tool.id === ToolIdConstants.TEXT_ID || tool.id === ToolIdConstants.SELECTION_ID) {
          tool.onKeyDown(event);
        }
      }
    });
    window.addEventListener('keyup', (event) => {
      if (this.drawingService.isCreated) {
        event.preventDefault();
        const tool = this.selectedTool;
        if (!tool) {
          return;
        }
        if (this.isPressed || tool.id === ToolIdConstants.LINE_ID
          || tool.id === ToolIdConstants.TEXT_ID || tool.id === ToolIdConstants.SELECTION_ID) {
          tool.onKeyUp(event);
        }
      }
    });
  }
}
