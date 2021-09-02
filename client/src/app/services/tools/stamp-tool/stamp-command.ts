import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { DEFAULT_SCALE_COEFFICIENT } from '../tools-constants';
import { Stamp } from './stamp.model';

/// Commande pour la creation d'etampe
export class StampCommand implements ICommand {

    private stamp: SVGElement | null;

    constructor(
        private renderer: Renderer2,
        private stampAttributes: Stamp,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'etampe
    getStamp(): SVGElement | null { return this.stamp; }

    /// Ajustement de l'angle de l'etampe
    setAngle(angle: number): void {
        if (this.stamp) {
            this.stampAttributes.angle = angle;
            this.renderer.setAttribute(this.stamp, 'transform', this.transformString());
        }
    }

    /// Ajout de l'etampe
    execute(): void {
        if (!this.stamp) {
            this.stamp = this.renderer.createElement('g', 'svg') as SVGElement;
            this.renderer.setAttribute(this.stamp, 'name', 'stamp');
            this.renderer.setAttribute(this.stamp, 'transform', `${this.transformString()}`);
            const svg = (new DOMParser()).parseFromString(this.stampAttributes.svgString, 'image/svg+xml');
            svg.documentElement.childNodes.forEach((child) => {
                this.renderer.setAttribute(child, 'name', 'stamp');
                this.renderer.appendChild(this.stamp, child.cloneNode());
            });
        }
        this.drawingService.addObject(this.stamp);
    }

    /// Retrait de l'etampe
    undo(): void {
        if (this.stamp) {
            this.drawingService.removeObject(Number(this.stamp.id));
        }
    }

    changePosition(point: Point) {
        this.stampAttributes.x = point.x;
        this.stampAttributes.y = point.y;
        this.renderer.setAttribute(this.stamp, 'transform', `${this.transformString()}`);
    }

    /// Creation du string de rotation de l'etampe
    private transformString(): string {
        const xTransform: number = this.stampAttributes.x + this.stampAttributes.sizeFactor / 2;
        const yTransform: number = this.stampAttributes.y + this.stampAttributes.sizeFactor / 2;
        // tslint:disable-next-line: max-line-length
        return `rotate(${this.stampAttributes.angle},${xTransform},${yTransform}) translate (${this.stampAttributes.x.toString()} ${this.stampAttributes.y.toString()}) scale (${(this.stampAttributes.sizeFactor / DEFAULT_SCALE_COEFFICIENT).toString()} ${(this.stampAttributes.sizeFactor / DEFAULT_SCALE_COEFFICIENT).toString()})`;
    }

}
