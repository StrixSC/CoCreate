import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faPencilAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { PencilCommand } from './pencil-command';
import { Pencil } from './pencil.model';

/// Service de l'outil pencil, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: 'root',
})
export class PencilToolService implements Tools {
  readonly toolName = 'Outil Crayon';
  readonly faIcon: IconDefinition = faPencilAlt;
  readonly id = ToolIdConstants.PENCIL_ID;
  private strokeWidth: FormControl;
  private pencil: Pencil | null;
  private pencilCommand: PencilCommand | null;
  parameters: FormGroup;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
    });
  }

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.strokeWidth.valid) {
        const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        this.pencil = {
          pointsList: [offset],
          strokeWidth: this.strokeWidth.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        };
        if (event.button === LEFT_CLICK) {
          this.pencil.stroke = this.colorTool.primaryColorString;
          this.pencil.strokeOpacity = this.colorTool.primaryAlpha.toString();
        } else {
          this.pencil.stroke = this.colorTool.secondaryColorString;
          this.pencil.strokeOpacity = this.colorTool.secondaryAlpha.toString();
        }
        this.pencilCommand = new PencilCommand(this.rendererService.renderer, this.pencil, this.drawingService);
        this.pencilCommand.execute();
      }
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void | ICommand {
    this.pencil = null;
    if (this.pencilCommand) {
      const returnPencilCommand = this.pencilCommand;
      this.pencilCommand = null;
      return returnPencilCommand;
    }
    return;
  }

  /// Ajout d'un point selon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if (this.pencilCommand) {
      this.pencilCommand.addPoint(this.offsetManager.offsetFromMouseEvent(event));
    }
  }
  onKeyUp(event: KeyboardEvent): void {
    return;
  }
  onKeyDown(event: KeyboardEvent): void {
    return;
  }
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

}
