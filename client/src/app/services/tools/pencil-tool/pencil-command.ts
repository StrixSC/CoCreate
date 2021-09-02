import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { Pencil } from './pencil.model';

/// Commande pour ajouter un objet de type pencil sur le dessin
export class PencilCommand implements ICommand {

    private pencil: SVGPolylineElement | null = null;
    private dot: SVGCircleElement | null = null;
    constructor(
        readonly renderer: Renderer2,
        private pencilAttributes: Pencil,
        private drawingService: DrawingService,
    ) { }

    /// Transformation de la liste des points vers la version SVG en string
    private pointString(): string {
        let pointString = '';
        for (const point of this.pencilAttributes.pointsList) {
            pointString += `${point.x} ${point.y},`;
        }
        return pointString.substring(0, pointString.length - 1);

    }

    /// Recuperation de l'objet svg pour le pencil
    getPencil(): SVGPolylineElement | null { return this.pencil; }
    /// Recuperation de l'objet svg pour le point lors de l'initialisation du pencil
    getDot(): SVGCircleElement | null { return this.dot; }

    /// Ajout d'un point dans la liste de point de l'objet pencil
    addPoint(point: Point): void {
        this.pencilAttributes.pointsList.push(point);
        if (this.pencilAttributes.pointsList.length > 1 && this.dot && !this.pencil) {
            this.drawingService.removeObject(Number(this.dot.id));
            this.dot = null;
            this.execute();
        } else if (this.pencil) {
            this.renderer.setAttribute(this.pencil, 'points', this.pointString());
        }
    }

    /// Creer le bon objet et l'ajoute au dessin
    execute(): void {
        if (this.pencil) {
            this.drawingService.addObject(this.pencil);
        } else if (this.dot) {
            this.drawingService.addObject(this.dot);
        } else {
            if (this.pencilAttributes.pointsList.length <= 1) {
                this.dot = this.renderer.createElement('circle', 'svg') as SVGCircleElement;
                this.renderer.setAttribute(this.dot, 'cx', this.pencilAttributes.pointsList[0].x.toString() + 'px');
                this.renderer.setAttribute(this.dot, 'cy', this.pencilAttributes.pointsList[0].y.toString() + 'px');
                this.renderer.setAttribute(this.dot, 'r', (this.pencilAttributes.strokeWidth / 2).toString() + 'px');
                this.renderer.setAttribute(this.dot, 'name', 'dot');
                this.renderer.setStyle(this.dot, 'fill', this.pencilAttributes.stroke);
                this.renderer.setStyle(this.dot, 'stroke', 'none');
                this.renderer.setStyle(this.dot, 'fillOpacity', this.pencilAttributes.strokeOpacity);
                this.drawingService.addObject(this.dot);
            } else {
                this.pencil = this.renderer.createElement('polyline', 'svg') as SVGPolylineElement;
                this.renderer.setAttribute(this.pencil, 'name', 'pencil');
                this.renderer.setAttribute(this.pencil, 'points', this.pointString());
                this.renderer.setStyle(this.pencil, 'stroke-width', this.pencilAttributes.strokeWidth.toString() + 'px');
                this.renderer.setStyle(this.pencil, 'stroke-linecap', `round`);
                this.renderer.setStyle(this.pencil, 'stroke-linejoin', `round`);
                this.renderer.setStyle(this.pencil, 'fill', this.pencilAttributes.fill);
                this.renderer.setStyle(this.pencil, 'stroke', this.pencilAttributes.stroke);
                this.renderer.setStyle(this.pencil, 'fillOpacity', this.pencilAttributes.fillOpacity);
                this.renderer.setStyle(this.pencil, 'strokeOpacity', this.pencilAttributes.strokeOpacity);
                this.drawingService.addObject(this.pencil);
            }
        }
    }

    /// Retrait des bons objets
    undo(): void {
        if (this.dot) {
            this.drawingService.removeObject(Number(this.dot.id));
        }
        if (this.pencil) {
            this.drawingService.removeObject(Number(this.pencil.id));
        }
    }

}
