import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { FilledShape } from '../tool-rectangle/filed-shape.model';

/// Commande pour permettre la creatio d'ellipse
export class EllipseCommand implements ICommand {

    private ellipse: SVGEllipseElement;

    constructor(
        readonly renderer: Renderer2,
        private ellipseAttributes: FilledShape,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'element SVG ellipse
    getEllipse(): SVGEllipseElement { return this.ellipse; }

    /// Ajustement de la largeur de l'ellipse
    setWidth(width: number): void {
        this.ellipseAttributes.width = width;
        if (this.ellipse) {
            this.renderer.setAttribute(this.ellipse, 'width', this.ellipseAttributes.width.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'rx', (this.ellipseAttributes.width / 2).toString() + 'px');
        }
    }

    /// Ajustement de la hauteur de l'ellipse
    setHeight(height: number): void {
        this.ellipseAttributes.height = height;
        if (this.ellipse) {
            this.renderer.setAttribute(this.ellipse, 'height', this.ellipseAttributes.height.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'ry', (this.ellipseAttributes.height / 2).toString() + 'px');
        }
    }

    /// Ajustement du centre X de l'ellipse
    setCX(cx: number): void {
        this.ellipseAttributes.x = cx;
        if (this.ellipse) {
            this.renderer.setAttribute(this.ellipse, 'cx', this.ellipseAttributes.x.toString() + 'px');
        }
    }

    /// Ajustement du centre Y de l'ellipse
    setCY(cy: number): void {
        this.ellipseAttributes.y = cy;
        if (this.ellipse) {
            this.renderer.setAttribute(this.ellipse, 'cy', this.ellipseAttributes.y.toString() + 'px');
        }
    }

    /// Creation et ajout de l'ellipse au dessin
    execute(): void {
        if (!this.ellipse) {
            this.ellipse = this.renderer.createElement('ellipse', 'svg');
            this.renderer.setAttribute(this.ellipse, 'name', 'ellipse');
            this.renderer.setAttribute(this.ellipse, 'cx', this.ellipseAttributes.x.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'cy', this.ellipseAttributes.y.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'width', this.ellipseAttributes.width.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'height', this.ellipseAttributes.height.toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'rx', (this.ellipseAttributes.width / 2).toString() + 'px');
            this.renderer.setAttribute(this.ellipse, 'ry', (this.ellipseAttributes.height / 2).toString() + 'px');
            this.renderer.setStyle(this.ellipse, 'stroke-width', this.ellipseAttributes.strokeWidth.toString() + 'px');
            this.renderer.setStyle(this.ellipse, 'fill', this.ellipseAttributes.fill);
            this.renderer.setStyle(this.ellipse, 'stroke', this.ellipseAttributes.stroke);
            this.renderer.setStyle(this.ellipse, 'fillOpacity', this.ellipseAttributes.fillOpacity.toString());
            this.renderer.setStyle(this.ellipse, 'strokeOpacity', this.ellipseAttributes.strokeOpacity.toString());
        }
        this.drawingService.addObject(this.ellipse);
    }

    /// Retrait de l'ellipse au dessin
    undo(): void {
        if (this.ellipse) {
            this.drawingService.removeObject(Number(this.ellipse.id));
        }
    }

}
