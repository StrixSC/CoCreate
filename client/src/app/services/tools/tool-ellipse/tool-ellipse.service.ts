import { setStyle } from './../../../utils/colors';
import { SyncDrawingService } from './../../syncdrawing.service';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Tools } from '../../../interfaces/tools.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { ToolIdConstants } from '../tool-id-constants';
import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { EllipseCommand } from './ellipse-command';
import { DrawingState, ShapeType } from 'src/app/model/IAction.model';

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

  private x: number;
  private y: number;

  private isDrawing = false;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
    private syncService: SyncDrawingService,
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
    if (this.isDrawing) {
      return;
    }

    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      this.isDrawing = true;
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

      this.ellipse = {
        x: this.x, y: this.y,
        width: 0, height: 0,
        strokeWidth: this.strokeWidth.value as number,
        fill: 'none', stroke: 'none', fillOpacity: 'none', strokeOpacity: 'none',
      };

      if (event.button === LEFT_CLICK) {
        setStyle(
          this.ellipse,
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.ellipseStyle.value
        );
      } else {
        setStyle(
          this.ellipse,
          this.colorTool.secondaryColorString,
          this.colorTool.secondaryAlpha.toString(),
          this.colorTool.primaryColorString,
          this.colorTool.primaryAlpha.toString(),
          this.ellipseStyle.value
        );
      }
      this.syncService.sendShape(DrawingState.down, this.ellipseStyle.value, ShapeType.Ellipse, this.ellipse);
    }
  }

  /// Quand le bouton de la sourie est relaché, l'objet courrant de l'outil est mis a null.
  onRelease(): void {
    if (this.ellipse && this.isDrawing) {
      this.syncService.sendShape(DrawingState.up, this.ellipseStyle.value, ShapeType.Ellipse, this.ellipse!);
      this.ellipse = null;
      this.isDrawing = false;
    }
    return;
  }

  /// Quand le bouton de la sourie est apuyé et on bouge celle-ci, l'objet courrant subit des modifications.
  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    if (this.isDrawing && this.ellipse) {
      const command = new EllipseCommand(this.rendererService.renderer, this.ellipse, this.drawingService);
      this.setSize(command, offset.x, offset.y);
      this.syncService.sendShape(DrawingState.move, this.ellipseStyle.value, ShapeType.Ellipse, this.ellipse!);
    }
  }

  /// Verification de la touche shift
  onKeyDown(event: KeyboardEvent): void {
  }

  /// Verification de la touche shift
  onKeyUp(event: KeyboardEvent): void {
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Transforme le size de l'objet courrant avec un x et un y en entrée
  private setSize(command: EllipseCommand, mouseX: number, mouseY: number): void {
    if (!this.ellipse) {
      return;
    }
    let strokeFactor = 0;
    if (this.ellipse.stroke !== 'none') {
      strokeFactor = this.strokeWidth.value;
    }

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

    xValue += width / 2;
    yValue += height / 2;

    command.setCX(xValue);
    command.setCY(yValue);
    command.setHeight((height - strokeFactor) <= 0 ? 1 : (height - strokeFactor));
    command.setWidth((width - strokeFactor) <= 0 ? 1 : (width - strokeFactor));
  }
}
