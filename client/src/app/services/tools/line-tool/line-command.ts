import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { Line } from './line.model';

/// Commande pour la création de ligne
export class LineCommand implements ICommand {

    private line: SVGPolylineElement;
    private markerDefs: SVGDefsElement;

    constructor(private renderer: Renderer2, private lineAttributes: Line, private drawingService: DrawingService) { }

    /// Transformation de la liste des points vers la version SVG en striung
    private pointString(): string {
        let pointString = '';
        for (const point of this.lineAttributes.pointsList) {
            pointString += `${point.x} ${point.y},`;
        }
        return pointString.substring(0, pointString.length - 1);
    }

    /// Recuperation de l'objet svg pour la ligne
    getLine(): SVGPolylineElement { return this.line; }
    /// Recuperation de l'objet svg pour les marker s'ils sont present
    getMarkerDefs(): SVGDefsElement { return this.markerDefs; }

    /// Recuperation du nombre de point dans la liste de point
    get pointsLength(): number { return this.lineAttributes.pointsList.length; }

    /// Ajout d'un point dans la liste de point
    addPoint(point: Point): void {
        this.lineAttributes.pointsList.push(point);
        if (this.line) {
            this.renderer.setAttribute(this.line, 'points', this.pointString());
        }
    }

    /// Mise a jour du dernier point
    updatePoint(point: Point): void {
        this.lineAttributes.pointsList.pop();
        this.lineAttributes.pointsList.push(point);
        if (this.line) {
            this.renderer.setAttribute(this.line, 'points', this.pointString());
        }
    }

    /// Retrait du dernier point
    removeLastPoint(): void {
        this.lineAttributes.pointsList.pop();
        if (this.line) {
            this.renderer.setAttribute(this.line, 'points', this.pointString());
        }
    }

    /// Finaliser la ligne selon une boucle ou non
    finishLine(isLoopLine: boolean): void {
        if (isLoopLine) {
            this.lineAttributes.pointsList[this.lineAttributes.pointsList.length - 1] = this.lineAttributes.pointsList[0];
        } else {
            this.lineAttributes.pointsList.pop();
        }
        if (this.line) {
            this.renderer.setAttribute(this.line, 'points', this.pointString());
        }
    }

    /// Creation de la ligne selon les attribut de ligne et ajout au dessin
    execute(): void {
        if (!this.line) {
            this.line = this.renderer.createElement('polyline', 'svg');
            this.renderer.setAttribute(this.line, 'name', 'line');
            this.renderer.setAttribute(this.line, 'points', this.pointString());
            this.renderer.setStyle(this.line, 'fill', this.lineAttributes.fill);
            this.renderer.setStyle(this.line, 'stroke', this.lineAttributes.stroke);
            this.renderer.setStyle(this.line, 'fillOpacity', this.lineAttributes.fillOpacity);
            this.renderer.setStyle(this.line, 'strokeWidth', this.lineAttributes.strokeWidth.toString() + 'px');
            this.renderer.setStyle(this.line, 'strokeOpacity', this.lineAttributes.strokeOpacity);
            this.renderer.setStyle(this.line, 'stroke-linecap', this.lineAttributes.strokeLinecap);
            this.renderer.setStyle(this.line, 'stroke-linejoin', this.lineAttributes.strokeLinejoin);
            this.renderer.setStyle(this.line, 'stroke-dasharray', this.lineAttributes.strokeDasharray + 'px');

            if (this.lineAttributes.markerVisibility === 'visible') {
                this.markerDefs = this.renderer.createElement('defs', 'svg');
                const marker = this.renderer.createElement('marker', 'svg');
                this.renderer.setAttribute(marker, 'markerUnits', 'userSpaceOnUse');
                this.renderer.setAttribute(marker, 'markerHeight', this.lineAttributes.diameter.toString() + 'px');
                this.renderer.setAttribute(marker, 'markerWidth', this.lineAttributes.diameter.toString() + 'px');
                this.renderer.setAttribute(marker, 'viewBox',
                    `0 0 ${this.lineAttributes.diameter} ${this.lineAttributes.diameter}`);
                this.renderer.setAttribute(marker, 'refX', (this.lineAttributes.diameter / 2).toString() + 'px');
                this.renderer.setAttribute(marker, 'refY', (this.lineAttributes.diameter / 2).toString() + 'px');
                this.renderer.setProperty(marker, 'id', `${this.lineAttributes.diameter}-Marker-${this.lineAttributes.markerId}`);

                const circleMarker: SVGCircleElement = this.renderer.createElement('circle', 'svg');
                this.renderer.setAttribute(circleMarker, 'cx', (this.lineAttributes.diameter / 2).toString() + 'px');
                this.renderer.setAttribute(circleMarker, 'cy', (this.lineAttributes.diameter / 2).toString() + 'px');
                this.renderer.setAttribute(circleMarker, 'r', (this.lineAttributes.diameter / 2).toString() + 'px');
                this.renderer.setAttribute(circleMarker, 'visibility', this.lineAttributes.markerVisibility);
                this.renderer.setStyle(circleMarker, 'fill', this.lineAttributes.stroke);
                this.renderer.setStyle(circleMarker, 'stroke', 'none');
                this.renderer.setStyle(circleMarker, 'fillOpacity', this.lineAttributes.strokeOpacity);
                this.renderer.setStyle(circleMarker, 'strokeOpacity', 'none');

                this.renderer.appendChild(this.markerDefs, marker);
                this.renderer.appendChild(marker, circleMarker);

                this.renderer.setAttribute(this.line, 'marker-start',
                    `url(#${this.lineAttributes.diameter}-Marker-${this.lineAttributes.markerId})`);
                this.renderer.setAttribute(this.line, 'marker-mid',
                    `url(#${this.lineAttributes.diameter}-Marker-${this.lineAttributes.markerId})`);
                this.renderer.setAttribute(this.line, 'marker-end',
                    `url(#${this.lineAttributes.diameter}-Marker-${this.lineAttributes.markerId})`);
            }
        }
        this.drawingService.addObject(this.line);
        if (this.markerDefs) {
            this.drawingService.addObject(this.markerDefs);
        }
    }

    /// Retrait de la ligne et des marker du dessin
    undo(): void {
        if (this.line) {
            this.drawingService.removeObject(Number(this.line.id));
        }
        if (this.markerDefs) {
            this.drawingService.removeObject(Number(this.markerDefs.id));
        }
    }
}
