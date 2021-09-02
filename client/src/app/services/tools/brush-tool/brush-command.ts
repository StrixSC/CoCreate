import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { Pencil } from '../pencil-tool/pencil.model';

/// Commande pour ajouter un objet de type brush sur le dessin
export class BrushCommand implements ICommand {

    private brush: SVGPolylineElement | null = null;
    private dot: SVGCircleElement | null = null;
    constructor(
        readonly renderer: Renderer2,
        private brushAttributes: Pencil,
        private drawingService: DrawingService,
        private texture: SVGDefsElement,
    ) { }

    /// Transformation de la liste des points vers la version SVG en string
    private pointString(): string {
        let pointString = '';
        for (const point of this.brushAttributes.pointsList) {
            pointString += `${point.x} ${point.y},`;
        }
        return pointString.substring(0, pointString.length - 1);

    }

    /// Recuperation de l'objet svg pour la brush
    getBrush(): SVGPolylineElement | null { return this.brush; }
    /// Recuperation de l'objet svg pour le point lors de l'initialisation de la brush
    getDot(): SVGCircleElement | null { return this.dot; }

    /// Ajout d'un point dans la liste de point de l'objet brush
    addPoint(point: Point): void {
        this.brushAttributes.pointsList.push(point);
        if (this.brushAttributes.pointsList.length > 1 && this.dot && !this.brush) {
            this.drawingService.removeObject(Number(this.dot.id));
            this.dot = null;
            this.execute();
        } else if (this.brush) {
            this.renderer.setAttribute(this.brush, 'points', this.pointString());
        }
    }

    /// Creer le bon objet et l'ajoute au dessin
    execute(): void {
        this.drawingService.addObject(this.texture);
        if (this.brush) {
            this.drawingService.addObject(this.brush);
        } else if (this.dot) {
            this.drawingService.addObject(this.dot);
        } else {
            const texturePattern: SVGPatternElement = this.texture.children.item(0) as SVGPatternElement;
            const textureId: string = texturePattern.id;
            if (this.brushAttributes.pointsList.length <= 1) {
                this.dot = this.renderer.createElement('circle', 'svg') as SVGCircleElement;
                this.renderer.setAttribute(this.dot, 'cx', this.brushAttributes.pointsList[0].x.toString() + 'px');
                this.renderer.setAttribute(this.dot, 'cy', this.brushAttributes.pointsList[0].y.toString() + 'px');
                this.renderer.setAttribute(this.dot, 'r', (this.brushAttributes.strokeWidth / 2).toString() + 'px');
                this.renderer.setAttribute(this.dot, 'name', 'dot');
                this.renderer.setAttribute(this.dot, 'fill', `url(#${textureId})`);
                this.renderer.setAttribute(this.dot, 'stroke', 'none');
                this.drawingService.addObject(this.dot);
            } else {
                this.brush = this.renderer.createElement('polyline', 'svg') as SVGPolylineElement;
                this.renderer.setAttribute(this.brush, 'name', 'brush');
                this.renderer.setStyle(this.brush, 'stroke-width', this.brushAttributes.strokeWidth.toString() + 'px');
                this.renderer.setAttribute(this.brush, 'points', this.pointString());
                this.renderer.setStyle(this.brush, 'stroke-linecap', `round`);
                this.renderer.setStyle(this.brush, 'stroke-linejoin', `round`);
                this.renderer.setAttribute(this.brush, 'fill', this.brushAttributes.fill);
                this.renderer.setAttribute(this.brush, 'stroke', `url(#${textureId})`);
                this.renderer.setStyle(this.brush, 'fillOpacity', this.brushAttributes.fillOpacity);
                this.renderer.setStyle(this.brush, 'strokeOpacity', this.brushAttributes.strokeOpacity);
                this.drawingService.addObject(this.brush);
            }
        }
    }

    /// Retrait des bons objets
    undo(): void {
        this.drawingService.removeObject(Number(this.texture.id));
        if (this.dot) {
            this.drawingService.removeObject(Number(this.dot.id));
        }
        if (this.brush) {
            this.drawingService.removeObject(Number(this.brush.id));
        }
    }

}
