import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { Spray } from './spray.model';

/// Commande pour la creation de l'aerosol
export class SprayCommand implements ICommand {
    private spray: SVGGElement | null = null;
    constructor(
        readonly renderer: Renderer2,
        private sprayAttributes: Spray,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'objet aerosol
    getSpray(): SVGGElement | null { return this.spray; }
    /// Mise a jour des points
    updatePoint(): void {
        let i = 0;
        for (i; i < this.sprayAttributes.pointsList.length; i++) {
            const circle = this.renderer.createElement('circle', 'svg');
            this.renderer.setAttribute(circle, 'name', 'spray');
            this.renderer.setAttribute(circle, 'cx', this.sprayAttributes.pointsList[i].x.toString());
            this.renderer.setAttribute(circle, 'cy', this.sprayAttributes.pointsList[i].y.toString());
            this.renderer.setAttribute(circle, 'r', this.sprayAttributes.radius.toString());
            this.renderer.appendChild(this.spray, circle);
        }
    }

    /// Creation de l'objet aerosol et ajout de l'objet au dessin
    execute(): void {
        if (!this.spray) { /// Creation du spray
            this.spray = this.renderer.createElement('g', 'svg') as SVGGElement;
            this.renderer.setAttribute(this.spray, 'name', 'spray');
            this.renderer.setStyle(this.spray, 'stroke-width', this.sprayAttributes.radius.toString());
            this.renderer.setStyle(this.spray, 'fill', this.sprayAttributes.fill.toString());
            this.renderer.setStyle(this.spray, 'opacity', this.sprayAttributes.fillOpacity.toString());
        }
        this.drawingService.addObject(this.spray);
    }
    /// Retrait de l'aerosol du dessin
    undo(): void {
        if (this.spray) {
            this.drawingService.removeObject(Number(this.spray.id));
        }
    }
}
