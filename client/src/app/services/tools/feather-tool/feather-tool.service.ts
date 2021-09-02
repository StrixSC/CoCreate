import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faFeather, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { FEATHER_CONSTANTS, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { FeatherCommand } from './feather-command';
import { Feather } from './feather-model';

export const DEFAULT_ROTATION_ANGLE_INTERVAL = 15;
export const ALT_ROTATION_ANGLE_INTERVAL = 1;

@Injectable({
  providedIn: 'root',
})
export class FeatherToolService implements Tools {
  readonly id = ToolIdConstants.FEATHER_ID;
  faIcon: IconDefinition = faFeather;
  toolName = 'Outil Plume';
  private strokeWidth: FormControl;
  private rotationAngle: FormControl;

  parameters: FormGroup;
  private featherCommand: FeatherCommand | null;
  private feather: Feather | null;
  private currentPathDirectionQuadrant = 1;
  private directionChangeCount = 0;
  private visitedPoints = new Set<string>();
  private firstPoints: Point[] = [];
  private secondPoints: Point[] = [];
  private currentRotationInterval = DEFAULT_ROTATION_ANGLE_INTERVAL;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.strokeWidth = new FormControl(FEATHER_CONSTANTS.INITIAL_FEATHER_LENGTH, [Validators.min(FEATHER_CONSTANTS.MIN_FEATHER_LENGTH),
    Validators.max(FEATHER_CONSTANTS.MAX_FEATHER_LENGTH)]);
    this.rotationAngle = new FormControl(FEATHER_CONSTANTS.INITIAL_ROTATION_ANGLE, [Validators.min(FEATHER_CONSTANTS.MIN_ROTATION_ANGLE),
    Validators.max(FEATHER_CONSTANTS.MAX_ROTATION_ANGLE)]);
    this.parameters = new FormGroup({
      rotationAngle: this.rotationAngle,
      strokeWidth: this.strokeWidth,
    });
    this.setAngle = this.setAngle.bind(this);
    this.setKeyUpInterval = this.setKeyUpInterval.bind(this);
    this.setKeyDownInterval = this.setKeyDownInterval.bind(this);

  }

  /// Permet d'ajout un event listener sur la roulette de la souris pour ajuster l'angle de la plume
  registerEventListenerOnScroll() {
    window.addEventListener('wheel', this.setAngle);
    window.addEventListener('keydown', this.setKeyDownInterval);
    window.addEventListener('keyup', this.setKeyUpInterval);

  }
  removeEventListenerOnScroll() {
    window.removeEventListener('wheel', this.setAngle);
    window.addEventListener('keydown', this.setKeyDownInterval);
    window.addEventListener('keyup', this.setKeyUpInterval);

  }

  onPressed(event: MouseEvent): void {

    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      this.registerEventListenerOnScroll();
      if (this.strokeWidth.valid && this.rotationAngle.valid) {
        const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        this.feather = {
          pointsList: [offset],
          strokeWidth: this.strokeWidth.value,
          fill: event.button === LEFT_CLICK ? this.colorTool.primaryColorString : this.colorTool.secondaryColorString,
          stroke: event.button === LEFT_CLICK ? this.colorTool.primaryColorString : this.colorTool.secondaryColorString,
          fillOpacity: 'none',
          strokeOpacity: event.button === LEFT_CLICK ? this.colorTool.primaryAlpha.toString() : this.colorTool.secondaryAlpha.toString(),
          rotationAngle: this.rotationAngle.value,
        };

        this.featherCommand = new FeatherCommand(this.rendererService.renderer, this.drawingService,
          this.feather);
        this.featherCommand.execute();
        this.updatePath(event);

      }
    }
  }
  onRelease(): void | ICommand {
    this.removeEventListenerOnScroll();
    this.feather = null;
    this.directionChangeCount = 0;
    this.visitedPoints.clear();
    this.firstPoints = [];
    this.secondPoints = [];
    if (this.featherCommand) {
      const returnFeatherCommand = this.featherCommand;
      this.featherCommand = null;
      return returnFeatherCommand;
    }
    return;
  }
  updatePath(event: MouseEvent): void {
    if (this.featherCommand) {
      // detection de changement de direction
      if (this.getQuadrant(event.movementX, event.movementY) !== this.currentPathDirectionQuadrant &&
        this.directionChangeCount >= FEATHER_CONSTANTS.MAX_DIRECTION_CHANGE &&
        this.firstPoints.length >= 2 && this.secondPoints.length >= 2) {

        // commencer avec les derniers points du dernier path pour les changements de direction rapide
        this.firstPoints = [this.firstPoints[this.firstPoints.length - 2], this.firstPoints[this.firstPoints.length - 1]];
        this.secondPoints = [this.secondPoints[this.secondPoints.length - 2], this.secondPoints[this.secondPoints.length - 1]];
        this.visitedPoints.clear();
        this.directionChangeCount = 0;
        this.featherCommand.resetPath();
        this.currentPathDirectionQuadrant = this.getQuadrant(event.movementX, event.movementY);
      } else if (this.getQuadrant(event.movementX, event.movementY) !== this.currentPathDirectionQuadrant) {
        this.directionChangeCount++;
      }
      this.addBorderPoints(this.offsetManager.offsetFromMouseEvent(event));
      this.featherCommand.updateCurrentPath(this.generateBorderPointList());
    }
  }
  // retourne la liste de point du contour que la commande va interpreter
  generateBorderPointList(): Point[] {
    const borderPointList = [];
    borderPointList.push(...this.firstPoints);
    for (let i = this.secondPoints.length - 1; i >= 0; i--) {
      borderPointList.push(this.secondPoints[i]);
    }
    borderPointList.push(this.firstPoints[0]);
    return borderPointList;
  }
  onMove(event: MouseEvent): void {
    if (this.feather && this.featherCommand) {
      this.addPoint(this.feather, this.offsetManager.offsetFromMouseEvent(event));
      this.updatePath(event);
    }
  }
  addPoint(feather: Feather, point: Point): void {
    feather.pointsList.push(point);
  }
  addBorderPoints(point: Point) {
    const firstPoint: Point = {
      x: Math.round(point.x + Math.cos(this.rotationAngle.value) * (this.strokeWidth.value / 2)),
      y: Math.round(point.y + Math.sin(this.rotationAngle.value) * (this.strokeWidth.value / 2)),
    };
    const secondPoint: Point = {
      x: Math.round(point.x - Math.cos(this.rotationAngle.value) * (this.strokeWidth.value / 2)),
      y: Math.round(point.y - Math.sin(this.rotationAngle.value) * (this.strokeWidth.value / 2)),
    };
    // detection de collision
    if ((this.visitedPoints.has(`${firstPoint.x}-${firstPoint.y}`) || this.visitedPoints.has(`${secondPoint.x}-${secondPoint.y}`))
      && this.featherCommand) {
      this.firstPoints = [this.firstPoints[this.firstPoints.length - 1]];
      this.secondPoints = [this.secondPoints[this.secondPoints.length - 1]];
      this.visitedPoints.clear();
      this.directionChangeCount = 0;
      this.featherCommand.resetPath();

    }

    this.visitedPoints.add(`${firstPoint.x}-${firstPoint.y}`).add(`${secondPoint.x}-${secondPoint.y}`);
    this.firstPoints.push(firstPoint);
    this.secondPoints.push(secondPoint);
  }

  /// Ajustement de l'angle selon la valeur renvoyer par la roulette
  private setAngle(eventWheel: WheelEvent) {
    eventWheel.preventDefault();
    if (eventWheel.deltaY < 0) {
      this.setAngleBackward();
    } else {
      this.setAngleForward();
    }
  }

  /// Ajustement negatif de l'angle
  private setAngleBackward() {
    let newRotationAngle = this.rotationAngle.value - this.currentRotationInterval;
    if (newRotationAngle < 0) {
      newRotationAngle += 360;
    }
    this.rotationAngle.setValue(newRotationAngle);

  }

  /// Ajustement positif de l'angle
  private setAngleForward() {
    this.rotationAngle.setValue((this.rotationAngle.value + this.currentRotationInterval) % 360);
  }
  private setKeyDownInterval(event: KeyboardEvent) {
    if (event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.currentRotationInterval = ALT_ROTATION_ANGLE_INTERVAL;
    }
  }
  private setKeyUpInterval(event: KeyboardEvent) {
    if (event.key === KeyCodes.alt) {
      event.preventDefault();
      event.stopPropagation();
      this.currentRotationInterval = DEFAULT_ROTATION_ANGLE_INTERVAL;
    }
  }

  private getQuadrant(movX: number, movY: number): number {
    if (movX >= 0 && movY >= 0) {
      return 1;
    } else if (movX < 0 && movY > 0) {
      return 2;
    } else if (movX <= 0 && movY <= 0) {
      return 3;
    } else {
      return 4;
    }
  }
  onKeyDown(): void {
    return;
  }
  onKeyUp(): void {
    return;
  }
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

}
