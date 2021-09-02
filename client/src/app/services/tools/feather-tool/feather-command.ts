import { Injectable, Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { Feather } from './feather-model';

@Injectable({
  providedIn: 'root',
})
export class FeatherCommand implements ICommand {
  private feather: SVGGElement | null = null;
  private currentPath: SVGPathElement|null = null;

  constructor(
    readonly renderer: Renderer2,
    private drawingService: DrawingService,
    private featherAttributes: Feather,
  ) { }
/// Creation de l'objet de la plume et ajout de l'objet au dessin
  execute(): void {
    if (this.feather) {

        this.drawingService.addObject(this.feather);
    } else {
      this.feather = this.renderer.createElement('g', 'svg') as SVGGElement;
      this.renderer.setAttribute(this.feather, 'name', 'feather');
      this.renderer.setStyle(this.feather, 'stroke-linecap', `round`);
      this.renderer.setStyle(this.feather, 'stroke-linejoin', `round`);
      this.renderer.setStyle(this.feather, 'fill', this.featherAttributes.fill);
      this.renderer.setStyle(this.feather, 'stroke', this.featherAttributes.stroke);
      this.renderer.setStyle(this.feather, 'opacity', this.featherAttributes.strokeOpacity);
      this.drawingService.addObject(this.feather);
    }
  }

  updateCurrentPath(borderPointList: Point[]): void {
    let pathString = '';
    for (const point of borderPointList) {
      pathString += `${point.x} ${point.y},`;
    }
    pathString = `M ${borderPointList[0].x} ${borderPointList[0].y} L ${pathString} Z`;

    if (!this.currentPath) {
      this.currentPath = this.renderer.createElement('path', 'svg') as SVGPathElement;
      this.renderer.setAttribute(this.currentPath, 'name', 'feather');

    }
    this.renderer.setAttribute(this.currentPath, 'd', pathString);
    this.renderer.appendChild(this.feather, this.currentPath);

  }
  // dans le cas de changement de direction frequent ou collision, initier un nouveau path
  resetPath(): void {
    if (this.currentPath) {
      this.renderer.appendChild(this.feather, this.currentPath);
    }
    this.currentPath = this.renderer.createElement('path', 'svg') as SVGPathElement;
    this.renderer.setAttribute(this.currentPath, 'name', 'feather');
  }

  undo(): void {
    if (this.feather) {
        this.drawingService.removeObject(Number(this.feather.id));
    }
  }

}
