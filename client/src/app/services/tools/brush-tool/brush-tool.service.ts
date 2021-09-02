import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faPaintBrush, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { TexturesService } from 'src/app/services/textures/textures.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { Pencil } from '../pencil-tool/pencil.model';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { BrushCommand } from './brush-command';

/// Service de l'outil pinceau, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width et la texture
@Injectable({
  providedIn: 'root',
})
export class BrushToolService implements Tools {
  readonly id = ToolIdConstants.BRUSH_ID;
  readonly faIcon: IconDefinition = faPaintBrush;
  readonly toolName = 'Outil Pinceau';
  parameters: FormGroup;
  private strokeWidth: FormControl;
  texture: FormControl;
  private brush: Pencil | null;
  private brushCommand: BrushCommand | null;

  constructor(
    private texturesService: TexturesService,
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.texture = new FormControl(this.texturesService.firstTexture.value);
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      texture: this.texture,
    });
  }

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.strokeWidth.valid) {
        const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        this.brush = {
          pointsList: [offset],
          strokeWidth: this.strokeWidth.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        };
        let textureDefs: SVGDefsElement | null;
        if (event.button === LEFT_CLICK) {
          textureDefs = this.texturesService.getTextureElement(
            this.texture.value,
            { rgb: this.colorTool.primaryColor, a: this.colorTool.primaryAlpha },
            offset.x, offset.y,
            this.rendererService.renderer,
          );
        } else {
          textureDefs = this.texturesService.getTextureElement(
            this.texture.value,
            { rgb: this.colorTool.secondaryColor, a: this.colorTool.secondaryAlpha },
            offset.x, offset.y,
            this.rendererService.renderer,
          );
        }
        if (!textureDefs) {
          return;
        }
        this.brushCommand = new BrushCommand(this.rendererService.renderer, this.brush, this.drawingService, textureDefs);
        this.brushCommand.execute();
      }
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void | ICommand {
    this.brush = null;
    if (this.brushCommand) {
      const returnBrushCommand = this.brushCommand;
      this.brushCommand = null;
      return returnBrushCommand;
    }
    return;
  }

  /// Ajout d'un point seulon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if (this.brushCommand) {
      this.brushCommand.addPoint(this.offsetManager.offsetFromMouseEvent(event));
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
