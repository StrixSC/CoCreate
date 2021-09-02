import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { Text } from './text.model';

/// Commande pour la creation de text svg
export class TextCommand implements ICommand {

    private text: SVGTextElement;

    constructor(
        private renderer: Renderer2,
        private textAttributes: Text,
        private drawingService: DrawingService,
    ) { }

    /// Recuperation de l'element SVG du text
    getText(): SVGTextElement { return this.text; }

    /// Creation du text et ajustement des nouvelles linges
    execute(): void {
        if (!this.text) {
            const textString = this.textAttributes.text + '\n';
            const lines = textString.match(/(.*\n)/g) as RegExpMatchArray;
            this.text = this.renderer.createElement('text', 'svg');
            this.renderer.setAttribute(this.text, 'name', 'text');
            this.renderer.setStyle(this.text, 'font-size', this.textAttributes.fontSize + 'px');
            this.renderer.setStyle(this.text, 'font-family', this.textAttributes.fontFamily);
            this.renderer.setStyle(this.text, 'text-anchor', this.textAttributes.textAnchor);
            this.renderer.setStyle(this.text, 'font-style', this.textAttributes.fontStyle);
            this.renderer.setStyle(this.text, 'font-weight', this.textAttributes.fontWeight);
            this.renderer.setStyle(this.text, 'fill', this.textAttributes.fill);
            this.renderer.setStyle(this.text, 'fillOpacity', this.textAttributes.fillOpacity.toString());
            this.renderer.setStyle(this.text, 'user-select', 'none');
            this.renderer.setAttribute(this.text, 'y', this.textAttributes.y + 'px');
            this.renderer.setAttribute(this.text, 'x', this.textAttributes.x + 'px');
            this.drawingService.addObject(this.text);
            let maxWidth = -Infinity;
            let spanValue = 1.2;
            for (let t of lines) {
                t = t.replace('\n', '');
                if (t === '') {
                    spanValue += 1.2;
                } else {
                    const tspan: SVGTSpanElement = this.renderer.createElement('tspan', 'svg');
                    this.renderer.setAttribute(tspan, 'x', this.text.getAttribute('x') as string);
                    this.renderer.setAttribute(tspan, 'dy', spanValue + 'em');
                    this.renderer.appendChild(tspan, this.renderer.createText(t));
                    this.renderer.appendChild(this.text, tspan);
                    maxWidth = Math.max(tspan.getBoundingClientRect().width || 0, maxWidth);
                    spanValue = 1.2;
                }
            }
        }
        this.drawingService.addObject(this.text);
    }

    /// Retrait du text du dessin
    undo(): void {
        if (this.text) {
            this.drawingService.removeObject(Number(this.text.id));
        }
    }
}
