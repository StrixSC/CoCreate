import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { BucketFill } from './bucket-fill.model';

/// Commande pour ajouter un objet de type bucket fill sur le dessin
export class BucketFillCommand implements ICommand {

    private bucketFill: SVGImageElement;
    constructor(
        readonly renderer: Renderer2,
        private bucketFillAttributes: BucketFill,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'objet svg pour le bucket fill
    getFillElement(): SVGImageElement { return this.bucketFill; }

    /// Creer le bon objet et l'ajoute au dessin
    execute(): void {
        if (!this.bucketFill) {
            this.bucketFill = this.renderer.createElement('image', 'svg');
            this.renderer.setAttribute(this.bucketFill, 'name', 'bucket-fill');
            this.renderer.setAttribute(this.bucketFill, 'x', this.bucketFillAttributes.x + 'px');
            this.renderer.setAttribute(this.bucketFill, 'y', this.bucketFillAttributes.y + 'px');
            this.renderer.setAttribute(this.bucketFill, 'draggable', 'false');
            this.renderer.setStyle(this.bucketFill, 'user-drag', 'none');
            this.renderer.setStyle(this.bucketFill, 'user-select', 'none');
            this.renderer.setStyle(this.bucketFill, '-moz-user-drag', 'none');
            this.renderer.setStyle(this.bucketFill, '-moz-user-select', 'none');
            this.renderer.setAttribute(this.bucketFill, 'height', this.bucketFillAttributes.height + 'px');
            this.renderer.setAttribute(this.bucketFill, 'width', this.bucketFillAttributes.width + 'px');
            this.renderer.setAttribute(this.bucketFill, 'href', this.bucketFillAttributes.href);
            this.renderer.listen(this.bucketFill, 'mousedown', (event: MouseEvent) => {
                if (event.preventDefault) { event.preventDefault(); }
            });
        }
        this.drawingService.addObject(this.bucketFill);
    }

    /// Retrait des bons objets
    undo(): void {
        if (this.bucketFill) {
            this.drawingService.removeObject(Number(this.bucketFill.id));
        }
    }

}
