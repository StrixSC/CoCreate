import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faDrawPolygon, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { PolygonCommand } from './polygon-command';
import { Polygon } from './polygon.model';

const COMPLETE_ANGLE = 360;
const INITIAL_ANGLE = 270;

/// Service permettant la creation de polygon selon des parametre
@Injectable({
  providedIn: 'root',
})
export class PolygonToolService implements Tools {
  readonly faIcon: IconDefinition = faDrawPolygon;
  readonly toolName = 'Outil Polygone';
  readonly id = ToolIdConstants.POLYGON_ID;

  private border: SVGRectElement | null;
  private borderId: number;

  parameters: FormGroup;
  private strokeWidth: FormControl;
  private polygonStyle: FormControl;
  private vertexNumber: FormControl;
  private points: Point[];

  private x: number;
  private y: number;
  private center: Point;
  private radius: number;
  private polygonCommand: PolygonCommand | null;
  private polygon: Polygon;
  private sideLength: number;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.strokeWidth = new FormControl(1, Validators.min(1));
    this.polygonStyle = new FormControl('fill');
    this.vertexNumber = new FormControl(3, Validators.min(3));
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      polygonStyle: this.polygonStyle,
      vertexNumber: this.vertexNumber,
    });
  }

  /// Quand le bouton de la souris est enfoncé, on crée un polygone regulier et convex.
  /// On le retourne en sortie et il est inséré dans l'objet courant de l'outil.
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      this.border = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(this.border, 'stroke', `rgba(0, 0, 0, 1)`);
      this.rendererService.renderer.setStyle(this.border, 'stroke-width', `1px`);
      this.rendererService.renderer.setStyle(this.border, 'stroke-dasharray', `10,10`);
      this.rendererService.renderer.setStyle(this.border, 'd', `M5 40 l215 0`);
      this.rendererService.renderer.setStyle(this.border, 'fill', `none`);
      if (this.border) {
        this.borderId = this.drawingService.addObject(this.border);
      }

      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.x = offset.x;
      this.y = offset.y;
      this.polygon = {
        pointsList: [offset],
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
      this.polygonCommand = new PolygonCommand(this.rendererService.renderer, this.polygon, this.drawingService);
      this.polygonCommand.execute();
    }
  }

  /// Quand le bouton de la sourie est relaché, il n'existe plus d'objet courrant de l'outil.
  onRelease(event: MouseEvent): ICommand | void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.border) {
        this.drawingService.removeObject(this.borderId);
        this.borderId = 0;
      }
      if (this.polygonCommand) {
        const returnRectangleCommand = this.polygonCommand;
        this.polygonCommand = null;
        return returnRectangleCommand;
      }
      return;
    }
  }

  /// Transforme le size de l'objet courant avec un x et un y en entrée
  onMove(event: MouseEvent): void {
    if (this.polygonCommand) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.setSize(offset.x, offset.y);
    }
  }

  /// Effectively this tool does not need this
  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  /// Effectively this tool does not need this
  onKeyUp(event: KeyboardEvent): void {
    return;
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Ajustement du polygon selon la nouvelle position de la souris
  private setSize(mouseX: number, mouseY: number): void {
    if (!this.polygonCommand || !this.polygon) {
      return;
    }
    let scaleFactor = 0;
    if (this.polygon.stroke !== 'none') {
      scaleFactor = this.strokeWidth.value;
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

    const minSide = Math.min(width, height);
    if (mouseX < this.x) {
      xValue += (width - minSide);
    }
    if (mouseY < this.y) {
      yValue += (height - minSide);
    }
    width = minSide;
    height = minSide;

    this.center = { x: xValue + minSide / 2, y: yValue + minSide / 2 };

    this.rendererService.renderer.setAttribute(this.border, 'x', xValue + 'px');
    this.rendererService.renderer.setAttribute(this.border, 'y', yValue + 'px');

    this.rendererService.renderer.setAttribute(this.border, 'width', minSide + 'px');
    this.rendererService.renderer.setAttribute(this.border, 'height', minSide + 'px');
    this.sideLength = minSide - scaleFactor / 2;
    this.points = this.calculatePolygon(minSide);

    this.scalePolygon();

    this.polygonCommand.resize(this.points);
  }

  /// Ajustement du style du polygon
  private setStyle(primaryColor: string, primaryAlphas: string, secondaryColor: string, secondaryAlpha: string): void {
    if (!this.polygon) {
      return;
    }
    switch (this.polygonStyle.value) {
      case 'center':
        this.polygon.fill = primaryColor;
        this.polygon.fillOpacity = primaryAlphas;
        this.polygon.stroke = 'none';
        this.polygon.strokeOpacity = 'none';
        break;

      case 'border':
        this.polygon.fill = 'none';
        this.polygon.fillOpacity = 'none';
        this.polygon.stroke = secondaryColor;
        this.polygon.strokeOpacity = secondaryAlpha;
        break;

      case 'fill':
        this.polygon.fill = primaryColor;
        this.polygon.fillOpacity = primaryAlphas;
        this.polygon.stroke = secondaryColor;
        this.polygon.strokeOpacity = secondaryAlpha;
        break;
    }
  }

  /// Centrer le polygon selon ses points
  private reCenterPolygon(polygon: Point[]): void {
    let minXPolygon = Infinity; let minYPolygon = Infinity;
    let maxXPolygon = -Infinity; let maxYPolygon = -Infinity;
    for (const p of this.points) {
      minXPolygon = Math.min(minXPolygon, p.x);
      minYPolygon = Math.min(minYPolygon, p.y);
      maxXPolygon = Math.max(maxXPolygon, p.x);
      maxYPolygon = Math.max(maxYPolygon, p.y);
    }

    const polyCenter: Point = { x: (minXPolygon + maxXPolygon) / 2, y: (minYPolygon + maxYPolygon) / 2 };
    const rectCenter: Point = this.center;

    const difY = rectCenter.y - polyCenter.y;
    const difX = rectCenter.x - polyCenter.x;

    polygon.forEach((point) => {
      point.y += difY;
      point.x += difX;
    });
  }

  /// Redimensionnement du polygone pour qu'il prenne toute l'espace
  private scalePolygon(): void {
    let minXPolygon = Infinity; let minYPolygon = Infinity;
    let maxXPolygon = -Infinity; let maxYPolygon = -Infinity;
    for (const p of this.points) {
      minXPolygon = Math.min(minXPolygon, p.x);
      minYPolygon = Math.min(minYPolygon, p.y);
      maxXPolygon = Math.max(maxXPolygon, p.x);
      maxYPolygon = Math.max(maxYPolygon, p.y);
    }

    const diffs = {
      top: minYPolygon - this.y,
      bot: this.y + this.sideLength - maxYPolygon,
      left: minXPolygon - this.x,
      right: this.x + this.sideLength - maxXPolygon,
    };

    this.points = this.calculatePolygon((this.sideLength + Math.min((diffs.right + diffs.left), (diffs.bot + diffs.top))));
    this.reCenterPolygon(this.points);
  }

  /// Creation du polygon selon le format du polygon
  private calculatePolygon(size: number): Point[] {
    /// reset array from previous values
    const polygonPoints: Point[] = [];
    /// determine circle angles
    const angle = COMPLETE_ANGLE / this.vertexNumber.value;
    /// determine radius
    this.radius = size / 2;
    /// determine x and y from origin and initial angle
    polygonPoints.push(this.calculatePoint(this.radius, 0, this.center));
    /// repeat last step but add angle as you go for the n-1 remaining sides/points
    let angleToAdd = 0;
    for (let i = 1; i < this.vertexNumber.value; i++) {
      angleToAdd += angle;
      polygonPoints.push(this.calculatePoint(this.radius, angleToAdd, this.center));
    }
    return polygonPoints;
  }

  /// Calculer la position d'un point selon un rayon, centre et angle
  private calculatePoint(radius: number, angleToAdd: number, center: Point): Point {
    const point = {} as Point;
    point.x = center.x + radius * Math.cos(this.angleToRAD((INITIAL_ANGLE + angleToAdd) % COMPLETE_ANGLE));
    point.y = center.y + radius * Math.sin(this.angleToRAD((INITIAL_ANGLE + angleToAdd) % COMPLETE_ANGLE));
    return point;
  }

  /// Transformation d'un angle en radient
  private angleToRAD(angle: number): number {
    return angle * Math.PI / (COMPLETE_ANGLE / 2);
  }
}
