import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { FilledShape } from './filed-shape.model';

/// Commande pour la creation de rectangles
export class RectangleCommand implements ICommand {

    private rectangle: SVGRectElement;

    constructor(
        readonly renderer: Renderer2,
        private rectangleAttributes: FilledShape,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'element SVG rectangle
    getRectangle(): SVGRectElement { return this.rectangle; }

    /// Ajustement de la largeur du rectangle
    setWidth(width: number): void {
        this.rectangleAttributes.width = width;
        if (this.rectangle) {
            this.renderer.setAttribute(this.rectangle, 'width', this.rectangleAttributes.width.toString() + 'px');
        }
    }

    /// Ajustement de la hauteur du rectangle
    setHeight(height: number): void {
        this.rectangleAttributes.height = height;
        if (this.rectangle) {
            this.renderer.setAttribute(this.rectangle, 'height', this.rectangleAttributes.height.toString() + 'px');
        }
    }

    /// Ajustement du coins superieur gauche en x
    setX(x: number): void {
        this.rectangleAttributes.x = x;
        if (this.rectangle) {
            this.renderer.setAttribute(this.rectangle, 'x', this.rectangleAttributes.x.toString() + 'px');
        }
    }

    /// Ajustement du coins superieur gauche en y
    setY(y: number) {
        this.rectangleAttributes.y = y;
        if (this.rectangle) {
            this.renderer.setAttribute(this.rectangle, 'y', this.rectangleAttributes.y.toString() + 'px');
        }
    }

    /// Creation du rectangle
    execute(): void {
        if (!this.rectangle) {
            this.rectangle = this.renderer.createElement('rect', 'svg');
            this.renderer.setAttribute(this.rectangle, 'name', 'rectangle');
            this.renderer.setAttribute(this.rectangle, 'x', this.rectangleAttributes.x.toString() + 'px');
            this.renderer.setAttribute(this.rectangle, 'y', this.rectangleAttributes.y.toString() + 'px');
            this.renderer.setAttribute(this.rectangle, 'width', this.rectangleAttributes.width.toString() + 'px');
            this.renderer.setAttribute(this.rectangle, 'height', this.rectangleAttributes.height.toString() + 'px');
            this.renderer.setStyle(this.rectangle, 'stroke-width', this.rectangleAttributes.strokeWidth.toString() + 'px');
            this.renderer.setStyle(this.rectangle, 'fill', this.rectangleAttributes.fill);
            this.renderer.setStyle(this.rectangle, 'stroke', this.rectangleAttributes.stroke);
            this.renderer.setStyle(this.rectangle, 'fillOpacity', this.rectangleAttributes.fillOpacity);
            this.renderer.setStyle(this.rectangle, 'strokeOpacity', this.rectangleAttributes.strokeOpacity);
        }
        this.drawingService.addObject(this.rectangle);
    }

    /// Retrait du rectangle
    undo(): void {
        if (this.rectangle) {
            this.drawingService.removeObject(Number(this.rectangle.id));
        }
    }

}
