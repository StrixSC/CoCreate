import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faSquareFull } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { FilledShape } from './filed-shape.model';
import { RectangleCommand } from './rectangle-command';

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

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
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
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
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
        this.setStyle(
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
        );
      } else {
        this.setStyle(
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
        );
      }
      this.rectangleCommand = new RectangleCommand(this.rendererService.renderer, this.rectangle, this.drawingService);
      this.rectangleCommand.execute();
    }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(event: MouseEvent): ICommand | void {
    this.isSquare = false;
    this.rectangle = null;
    if (this.rectangleCommand) {
      const returnRectangleCommand = this.rectangleCommand;
      this.rectangleCommand = null;
      return returnRectangleCommand;
    }
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    this.setSize(offset.x, offset.y);
  }

  /// Verification de la touche shift
  onKeyDown(event: KeyboardEvent): void {
    if (event.shiftKey) {
      this.isSquare = true;
      this.setSize(this.oldX, this.oldY);
    }
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      this.isSquare = false;
      this.setSize(this.oldX, this.oldY);
    }
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
  /// Transforme le size de l'objet courrant avec un x et un y en entrée
  private setSize(mouseX: number, mouseY: number): void {
    if (!this.rectangleCommand || !this.rectangle) {
      return;
    }
    let strokeFactor = 0;
    if (this.rectangle.stroke !== 'none') {
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

    this.rectangleCommand.setX(
      (width - strokeFactor) <= 0 ? xValue + strokeFactor / 2 + (width - strokeFactor) : xValue + strokeFactor / 2);
    this.rectangleCommand.setY(
      (height - strokeFactor) <= 0 ? yValue + strokeFactor / 2 + (height - strokeFactor) : yValue + strokeFactor / 2);
    this.rectangleCommand.setHeight((height - strokeFactor) <= 0 ? 1 : (height - strokeFactor));
    this.rectangleCommand.setWidth((width - strokeFactor) <= 0 ? 1 : (width - strokeFactor));
  }

  /// Pour definir le style du rectangle (complet, contour, centre)
  private setStyle(primaryColor: string, primaryAlpha: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.rectangle) {
      return;
    }
    switch (this.rectStyle.value) {
      case 'center':
        this.rectangle.fill = primaryColor;
        this.rectangle.fillOpacity = primaryAlpha;
        this.rectangle.stroke = 'none';
        this.rectangle.strokeOpacity = 'none';
        break;

      case 'border':
        this.rectangle.fill = 'none';
        this.rectangle.fillOpacity = 'none';
        this.rectangle.stroke = secondaryColor;
        this.rectangle.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.rectangle.fill = primaryColor;
        this.rectangle.fillOpacity = primaryAlpha;
        this.rectangle.stroke = secondaryColor;
        this.rectangle.strokeOpacity = secondaryAlpha;
        break;
    }
  }

}
