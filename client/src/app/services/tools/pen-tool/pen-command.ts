import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { Pencil } from '../pencil-tool/pencil.model';

/// Commande pour la creation de la plume
export class PenCommand implements ICommand {

    private pen: SVGGElement | null = null;
    private dot: SVGCircleElement | null = null;
    constructor(
        readonly renderer: Renderer2,
        private penAttributes: Pencil,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'objet svg pour la plume
    getPen(): SVGGElement | null { return this.pen; }
    /// Recuperation de l'objet svg pour le point lors de l'initialisation de la plume
    getDot(): SVGCircleElement | null { return this.dot; }

    /// Ajout d'un point dans la liste de point de l'objet brush et creation d'un segment de la plume
    addPoint(movementX: number, movementY: number, width: number): void {
        const lastPoint = this.penAttributes.pointsList[this.penAttributes.pointsList.length - 1];
        this.penAttributes.pointsList.push({ x: lastPoint.x + movementX, y: lastPoint.y + movementY });
        if (this.penAttributes.pointsList.length > 1 && this.dot && !this.pen) {
            this.drawingService.removeObject(Number(this.dot.id));
            this.dot = null;
            this.execute();
        } else if (this.pen) {
            /// Creer l'atribut d qui contient le M et L dans Path
            const lPath = ' L ' + (lastPoint.x + movementX) + ' ' + (lastPoint.y + movementY);
            const mPath = 'M ' + lastPoint.x + ' ' + lastPoint.y;
            const path = this.renderer.createElement('path', 'svg') as SVGPathElement;
            this.renderer.setAttribute(path, 'name', 'pen');
            this.renderer.setAttribute(path, 'd', mPath + lPath);
            this.renderer.setStyle(path, 'stroke-width', (width).toString() + 'px');
            this.renderer.appendChild(this.pen, path);
        }
    }

    /// Creation de l'objet de la plume et ajout de l'objet au dessin
    execute(): void {
        if (this.pen) {
            this.drawingService.addObject(this.pen);
        } else if (this.dot) {
            this.drawingService.addObject(this.dot);
        } else {
            if (this.penAttributes.pointsList.length <= 1) {
                this.dot = this.renderer.createElement('circle', 'svg') as SVGCircleElement;
                this.renderer.setAttribute(this.dot, 'cx', this.penAttributes.pointsList[0].x.toString());
                this.renderer.setAttribute(this.dot, 'cy', this.penAttributes.pointsList[0].y.toString());
                this.renderer.setAttribute(this.dot, 'r', (this.penAttributes.strokeWidth / 2).toString() + 'px');
                this.renderer.setAttribute(this.dot, 'name', 'dot');
                this.renderer.setStyle(this.dot, 'fill', this.penAttributes.stroke);
                this.renderer.setStyle(this.dot, 'stroke', 'none');
                this.renderer.setStyle(this.dot, 'fillOpacity', this.penAttributes.strokeOpacity);
                this.drawingService.addObject(this.dot);
            } else {
                this.pen = this.renderer.createElement('g', 'svg') as SVGGElement;
                this.renderer.setAttribute(this.pen, 'name', 'pen');
                this.renderer.setStyle(this.pen, 'stroke-linecap', `round`);
                this.renderer.setStyle(this.pen, 'stroke-linejoin', `round`);
                this.renderer.setStyle(this.pen, 'fill', this.penAttributes.fill);
                this.renderer.setStyle(this.pen, 'stroke', this.penAttributes.stroke);
                this.renderer.setStyle(this.pen, 'fillOpacity', this.penAttributes.fillOpacity);
                this.renderer.setStyle(this.pen, 'opacity', this.penAttributes.strokeOpacity);
                this.drawingService.addObject(this.pen);
            }
        }
    }

    /// Retrait de la plume du dessin
    undo(): void {
        if (this.dot) {
            this.drawingService.removeObject(Number(this.dot.id));
        }
        if (this.pen) {
            this.drawingService.removeObject(Number(this.pen.id));
        }
    }

}
