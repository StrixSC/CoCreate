import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faPenAlt, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { Pencil } from '../pencil-tool/pencil.model';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_MAX_STROKE_WIDTH, INITIAL_MIN_STROKE_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { PenCommand } from './pen-command';

const VALIDATOR_MIN_STROKE_WIDTH = 1;
const WIDTH_SCALE_FACTOR = 6;
/// Service pour generer des commandes pen et ajuster les parametre de cette dernière
@Injectable({
  providedIn: 'root',
})
export class PenToolService implements Tools {
  readonly toolName = 'Outil Stylo';
  readonly faIcon: IconDefinition = faPenAlt;
  readonly id = ToolIdConstants.PEN_ID;
  private minStrokeWidth: FormControl;
  private maxStrokeWidth: FormControl;
  parameters: FormGroup;
  private penCommand: PenCommand | null;
  private pen: Pencil | null;
  private travelDistance: number;
  private width: number;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService) {
    this.minStrokeWidth = new FormControl(INITIAL_MIN_STROKE_WIDTH, Validators.min(VALIDATOR_MIN_STROKE_WIDTH));
    this.maxStrokeWidth = new FormControl(INITIAL_MAX_STROKE_WIDTH, Validators.min(VALIDATOR_MIN_STROKE_WIDTH));
    this.parameters = new FormGroup({
      minStrokeWidth: this.minStrokeWidth,
      maxStrokeWidth: this.maxStrokeWidth,
    });

  }

  /// Démarage de la création des segments de la plume
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.maxStrokeWidth.valid && this.minStrokeWidth.valid && this.maxStrokeWidth.value >= this.minStrokeWidth.value) {
        const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        this.pen = {
          pointsList: [offset],
          strokeWidth: this.maxStrokeWidth.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        };
        if (event.button === LEFT_CLICK) {
          this.pen.stroke = this.colorTool.primaryColorString;
          this.pen.strokeOpacity = this.colorTool.primaryAlpha.toString();
        } else {
          this.pen.stroke = this.colorTool.secondaryColorString;
          this.pen.strokeOpacity = this.colorTool.secondaryAlpha.toString();
        }
        this.penCommand = new PenCommand(this.rendererService.renderer, this.pen, this.drawingService);
        this.penCommand.execute();

      }
    }
  }

  /// Terminer le trait de la plume
  onRelease(event: MouseEvent): void | ICommand {
    this.pen = null;
    if (this.penCommand) {
      const returnPenCommand = this.penCommand;
      this.penCommand = null;
      return returnPenCommand;
    }
    return;
  }

  /// Ajout de point selon le deplacement de la plume
  onMove(event: MouseEvent): void {
    if (this.penCommand) {
      this.getWidth(event);
      this.penCommand.addPoint(event.movementX, event.movementY, this.width);
    }
  }

  /// Calcul de largeur de la plume
  private getWidth(event: MouseEvent): void {
    /// Calculer la distance parcouru pour en deduire la largeur
    this.travelDistance = Math.sqrt((event.movementX * event.movementX) + (event.movementY * event.movementY));
    this.width = Math.max(this.maxStrokeWidth.value * (1 - Math.max(Math.log(this.travelDistance), 0) / WIDTH_SCALE_FACTOR),
      this.minStrokeWidth.value);
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
