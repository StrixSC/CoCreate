import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faStamp } from '@fortawesome/free-solid-svg-icons';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_SCALE, LEFT_CLICK } from '../tools-constants';
import { StampCommand } from './stamp-command';
import { Stamp } from './stamp.model';

const MIN_FACTOR_VALUE = 1;
const MIN_INTERVAL_ROTATION = 1;
const MAX_INTERVAL_ROTATION = 15;
const DEFAULT_ROTATION_ANGLE = 0;

/// Service pour la creation d'etampe selon des paramètres
@Injectable({
  providedIn: 'root',
})
export class StampToolService implements Tools {
  readonly id = ToolIdConstants.STAMP_ID;
  readonly faIcon: IconDefinition = faStamp;
  readonly toolName = 'Outil Étampe';
  parameters: FormGroup;
  private stampSvgString: FormControl;
  private facteurSize: FormControl;
  private stampCommand: StampCommand | null;
  private stamp: Stamp | null;
  angleRotation: number;
  intervaleDegresRotation = 15;

  constructor(
    private offsetManager: OffsetManagerService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.stampSvgString = new FormControl('');
    this.facteurSize = new FormControl(INITIAL_SCALE, Validators.min(MIN_FACTOR_VALUE));
    this.parameters = new FormGroup({
      stampSvgString: this.stampSvgString,
      facteurSize: this.facteurSize,
    });
    this.setAngle = this.setAngle.bind(this);
  }

  /// Permet d'ajout un event listener sur la roulette de la souris pour ajuster l'angle de l'etampe
  registerEventListenerOnScroll(): void {
    window.addEventListener('wheel', this.setAngle);
  }

  /// Creation de la commande etampe pour la positio de la souris
  onPressed(event: MouseEvent): void {
    if (event.button === LEFT_CLICK && this.stampSvgString.value) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.angleRotation = DEFAULT_ROTATION_ANGLE;
      const x: number = offset.x - this.facteurSize.value / 2;
      const y: number = offset.y - this.facteurSize.value / 2;
      this.stamp = {
        x, y, sizeFactor: this.facteurSize.value, svgString: this.stampSvgString.value, angle: this.angleRotation,
      };

      this.stampCommand = new StampCommand(this.rendererService.renderer, this.stamp, this.drawingService);
      this.stampCommand.execute();

      this.registerEventListenerOnScroll();
    }
  }

  /// Ajout de la commande et retrait des events listener
  onRelease(event: MouseEvent): void | StampCommand {
    window.removeEventListener('wheel', this.setAngle);
    this.stamp = null;
    if (this.stampCommand) {
      const returnStampCommand = this.stampCommand;
      this.stampCommand = null;
      return returnStampCommand;
    }
    return;
  }

  onMove(event: MouseEvent): void {
    if (this.stampCommand) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      offset.x -= this.facteurSize.value / 2;
      offset.y -= this.facteurSize.value / 2;
      this.stampCommand.changePosition(offset);
    }
    return;
  }

  /// Verification si la touche est ALT pour alterner la rotation
  onKeyDown(event: KeyboardEvent): void {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.intervaleDegresRotation = MIN_INTERVAL_ROTATION;
    }
  }

  /// Verification si la touche est ALT pour alterner la rotation
  onKeyUp(event: KeyboardEvent): void {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.intervaleDegresRotation = MAX_INTERVAL_ROTATION;
    }
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    if (this.stampCommand) {
      this.stampCommand.undo();
      this.stampCommand = null;
    }
    return;

  }

  /// Ajustement de l'angle selon la valeur renvoyer par la roulette
  private setAngle(eventWheel: WheelEvent): void {
    eventWheel.preventDefault();
    if (eventWheel.deltaY < 0) {
      this.setAngleBackward();
    } else {
      this.setAngleForward();
    }
  }

  /// Ajustement negatif de l'angle
  private setAngleBackward(): void {
    this.angleRotation -= this.intervaleDegresRotation;
    if (this.angleRotation < 0) {
      this.angleRotation += 360;
    }
    if (this.stampCommand) {
      this.stampCommand.setAngle(this.angleRotation);
    }
  }

  /// Ajustement positif de l'angle
  private setAngleForward(): void {
    this.angleRotation = (this.intervaleDegresRotation + this.angleRotation) % 360;
    if (this.stampCommand) {
      this.stampCommand.setAngle(this.angleRotation);
    }
  }
}
