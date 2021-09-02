import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { EllipseCommand } from './ellipse-command';

/// Outil pour créer des ellipse, click suivis de bouge suivis de relache crée l'ellipse
/// et avec shift créer un cercle
@Injectable({
  providedIn: 'root',
})
export class ToolEllipseService implements Tools {
  readonly faIcon: IconDefinition = faCircle;
  readonly toolName = 'Outil Ellipse';
  readonly id = ToolIdConstants.ELLIPSE_ID;

  private ellipse: FilledShape | null;
  private ellipseCommand: EllipseCommand | null;

  private contour: SVGRectElement | null;
  private contourId: number;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private ellipseStyle: FormControl;

  private isCircle = false;
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
    this.ellipseStyle = new FormControl('fill');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      ellipseStyle: this.ellipseStyle,
    });
  }

  /// Quand le bouton de la sourie est enfoncé, on crée un ellipse et on le retourne
  /// en sortie et est inceré dans l'objet courrant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      this.contour = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(this.contour, 'stroke', `rgba(0, 0, 0, 1)`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(this.contour, 'stroke-dasharray', `10,10`);
      this.rendererService.renderer.setStyle(this.contour, 'd', `M5 40 l215 0`);
      this.rendererService.renderer.setStyle(this.contour, 'fill', `none`);
      if (this.contour) {
        this.contourId = this.drawingService.addObject(this.contour);
      }

      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);

      this.x = offset.x;
      this.y = offset.y;
      this.oldX = offset.x;
      this.oldY = offset.y;

      this.ellipse = {
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
      this.ellipseCommand = new EllipseCommand(this.rendererService.renderer, this.ellipse, this.drawingService);
      this.ellipseCommand.execute();
    }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(event: MouseEvent): ICommand | void {
    this.isCircle = false;
    this.ellipse = null;
    if (this.contour) {
      this.drawingService.removeObject(this.contourId);
      this.contourId = -1;
    }
    if (this.ellipseCommand) {
      const returnEllipseCommand = this.ellipseCommand;
      this.ellipseCommand = null;
      return returnEllipseCommand;
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
      this.isCircle = true;
      this.setSize(this.oldX, this.oldY);
    }
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      this.isCircle = false;
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
    if (!this.ellipseCommand || !this.ellipse) {
      return;
    }
    let strokeFactor = 0;
    if (this.ellipse.stroke !== 'none') {
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

    if (this.isCircle) {
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
    xValue += width / 2;
    yValue += height / 2;

    this.ellipseCommand.setCX(xValue);
    this.ellipseCommand.setCY(yValue);
    this.ellipseCommand.setHeight((height - strokeFactor) <= 0 ? 1 : (height - strokeFactor));
    this.ellipseCommand.setWidth((width - strokeFactor) <= 0 ? 1 : (width - strokeFactor));

    this.rendererService.renderer.setAttribute(this.contour, 'x', (xValue - width / 2).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'y', (yValue - height / 2).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'width', (width).toString());
    this.rendererService.renderer.setAttribute(this.contour, 'height', (height).toString());
  }

  /// Ajustement du style de l'ellipse
  private setStyle(primaryColor: string, primaryAlphas: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.ellipse) {
      return;
    }
    switch (this.ellipseStyle.value) {
      case 'center':
        this.ellipse.fill = primaryColor;
        this.ellipse.fillOpacity = primaryAlphas;
        this.ellipse.stroke = 'none';
        this.ellipse.strokeOpacity = 'none';
        break;

      case 'border':
        this.ellipse.fill = 'none';
        this.ellipse.fillOpacity = 'none';
        this.ellipse.stroke = secondaryColor;
        this.ellipse.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.ellipse.fill = primaryColor;
        this.ellipse.fillOpacity = primaryAlphas;
        this.ellipse.stroke = secondaryColor;
        this.ellipse.strokeOpacity = secondaryAlpha;
        break;
    }
  }
}
