import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { Polygon } from './polygon.model';

/// Commande pour ajouter un objet de type polygon sur le dessin
export class PolygonCommand implements ICommand {

    private polygon: SVGPolygonElement;

    constructor(
        private renderer: Renderer2,
        private polygonAttributes: Polygon,
        private drawingService: DrawingService,
    ) { }

    /// Transformation de la liste des points vers la version SVG en string
    private pointString(): string {
        let pointString = '';
        for (const point of this.polygonAttributes.pointsList) {
            pointString += `${point.x} ${point.y},`;
        }
        return pointString.substring(0, pointString.length - 1);
    }

    /// Recuperation de l'objet svg pour le polygon
    getPolygon(): SVGPolygonElement { return this.polygon; }

    /// Réajustement des points selon une nouvelle liste de point
    resize(points: Point[]): void {
        if (points.length > 0) {
            this.polygonAttributes.pointsList = points;
            let maxX = -Infinity; let maxY = -Infinity; let minX = Infinity; let minY = Infinity;
            for (const point of this.polygonAttributes.pointsList) {
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
            this.polygonAttributes.x = minX;
            this.polygonAttributes.y = minY;
            this.polygonAttributes.width = maxX - minX;
            this.polygonAttributes.height = maxY - minY;
            if (this.polygon) {
                this.renderer.setAttribute(this.polygon, 'x', this.polygonAttributes.x.toString() + 'px');
                this.renderer.setAttribute(this.polygon, 'y', this.polygonAttributes.y.toString() + 'px');
                this.renderer.setAttribute(this.polygon, 'width', this.polygonAttributes.width.toString() + 'px');
                this.renderer.setAttribute(this.polygon, 'height', this.polygonAttributes.height.toString() + 'px');
                this.renderer.setAttribute(this.polygon, 'points', this.pointString());
            }
        }
    }

    /// Création et ajout du polygone dans le dessin
    execute(): void {
        if (!this.polygon) {
            this.polygon = this.renderer.createElement('polygon', 'svg') as SVGPolygonElement;
            this.renderer.setAttribute(this.polygon, 'name', 'polygon');
            this.renderer.setAttribute(this.polygon, 'x', this.polygonAttributes.x.toString() + 'px');
            this.renderer.setAttribute(this.polygon, 'y', this.polygonAttributes.y.toString() + 'px');
            this.renderer.setAttribute(this.polygon, 'width', this.polygonAttributes.width.toString() + 'px');
            this.renderer.setAttribute(this.polygon, 'height', this.polygonAttributes.height.toString() + 'px');
            this.renderer.setAttribute(this.polygon, 'points', this.pointString());
            this.renderer.setStyle(this.polygon, 'stroke-width', this.polygonAttributes.strokeWidth.toString() + 'px');
            this.renderer.setStyle(this.polygon, 'fill', this.polygonAttributes.fill);
            this.renderer.setStyle(this.polygon, 'stroke', this.polygonAttributes.stroke);
            this.renderer.setStyle(this.polygon, 'fillOpacity', this.polygonAttributes.fillOpacity.toString());
            this.renderer.setStyle(this.polygon, 'strokeOpacity', this.polygonAttributes.strokeOpacity.toString());
            this.renderer.setStyle(this.polygon, 'strokeLinejoin', 'round');
        }
        this.drawingService.addObject(this.polygon);
    }

    /// Retrait du polygo dans le dessin
    undo(): void {
        if (this.polygon) {
            this.drawingService.removeObject(Number(this.polygon.id));
        }
    }
}
