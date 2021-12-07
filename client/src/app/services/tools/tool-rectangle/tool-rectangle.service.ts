import { DrawingState, ShapeType, ShapeStyle } from './../../../model/IAction.model';
import { SyncDrawingService } from './../../syncdrawing.service';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faSquareFull } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Tools } from '../../../interfaces/tools.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { FilledShape } from './filed-shape.model';
import { RectangleCommand } from './rectangle-command';
import { setStyle } from 'src/app/utils/colors';

/// Outil pour créer des rectangle, click suivis de bouge suivis de relache crée le rectangle
/// et avec shift créer un carrée
@Injectable({
  providedIn: 'root',
})
export class ToolRectangleService implements Tools {
  readonly faIcon: IconDefinition = faSquareFull;
  readonly toolName = 'Outil Rectangle';
  readonly id = ToolIdConstants.RECTANGLE_ID;

  private rectangle: FilledShape | null = null;
  private rectangleCommand: RectangleCommand | null = null;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private rectStyle: FormControl;

  private isSquare = false;
  private oldX = 0;
  private oldY = 0;

  private x: number;
  private y: number;

  private isDrawing: boolean = false;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
    private syncService: SyncDrawingService
  ) {
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.rectStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      rectStyle: this.rectStyle,
    });
  }

  /// Quand le bouton de la sourie est enfoncé, on crée un rectangle et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (this.isDrawing) {
      return;
    }

    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      this.isDrawing = true;
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.x = offset.x;
      this.y = offset.y;
      this.oldX = offset.x;
      this.oldY = offset.y;
      this.rectangle = {
        x: this.x, y: this.y,
        width: 0, height: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };
      if (event.button === LEFT_CLICK) {
        setStyle(
          this.rectangle,
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.rectStyle.value
        );
      } else {
        setStyle(
          this.rectangle,
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
          this.rectStyle.value
        );
      }
      this.syncService.sendShape({ x: offset.x, y: offset.y }, DrawingState.down, this.rectStyle.value, ShapeType.Rectangle, this.rectangle);
    }
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    if (this.rectangle && this.isDrawing) {
      const recCommand = new RectangleCommand(this.rendererService.renderer, this.rectangle, this.drawingService);
      this.setSize(recCommand, this.rectangle, offset.x, offset.y);
      this.syncService.sendShape(offset, DrawingState.move, this.rectStyle.value, ShapeType.Rectangle, this.rectangle);
    }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(event: MouseEvent): void {
    this.isSquare = false;
    if (this.rectangle && this.isDrawing) {
      this.syncService.sendShape({ x: event.offsetX, y: event.offsetY }, DrawingState.up, this.rectStyle.value, ShapeType.Rectangle, this.rectangle!);
      this.isDrawing = false;
      this.rectangle = null;
    }
  }

  /// Verification de la touche shift
  onKeyDown(event: KeyboardEvent): void {
    if (event.shiftKey) {
      this.isSquare = true;
      if (this.rectangleCommand && this.rectangle) {
        this.setSize(this.rectangleCommand, this.rectangle, this.oldX, this.oldY);
      }
    }
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      this.isSquare = false;
      if (this.rectangleCommand && this.rectangle) {
        this.setSize(this.rectangleCommand, this.rectangle, this.oldX, this.oldY);
      }
    }
  }

  pickupTool(): void {
    return;
  }

  dropTool(): void {
    return;
  }

  /// Transforme le size de l'objet courrant avec un x et un y en entrée
  setSize(rectangleCommand: RectangleCommand, rectangle: FilledShape, mouseX: number, mouseY: number): void {
    if (!rectangleCommand || !rectangle) {
      return;
    }
    let strokeFactor = 0;
    if (rectangle.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
    }

    this.oldX = mouseX;
    this.oldY = mouseY;

    let width = Math.abs(mouseX - this.x);
    let height = Math.abs(mouseY - this.y);
    let xValue = this.x;
    let yValue = this.y;

    if (mouseY < this.y) {
      yValue = mouseY;
    }
    if (mouseX < this.x) {
      xValue = mouseX;
    }

    if (this.isSquare) {
      const minSide = Math.min(width, height);
      if (mouseX < this.x) {
        xValue += (width - minSide);
      }
      if (mouseY < this.y) {
        yValue += (height - minSide);
      }
      width = minSide;
      height = minSide;
    }

    rectangleCommand.setX(
      (width - strokeFactor) <= 0 ? xValue + strokeFactor / 2 + (width - strokeFactor) : xValue + strokeFactor / 2);
    rectangleCommand.setY(
      (height - strokeFactor) <= 0 ? yValue + strokeFactor / 2 + (height - strokeFactor) : yValue + strokeFactor / 2);
    rectangleCommand.setHeight((height - strokeFactor) <= 0 ? 1 : (height - strokeFactor));
    rectangleCommand.setWidth((width - strokeFactor) <= 0 ? 1 : (width - strokeFactor));
  }

  /// Pour definir le style du rectangle (complet, contour, centre)

}
