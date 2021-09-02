import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';

export class TranslateCommand implements ICommand {
    private previousTransformation: Map<string, string> = new Map<string, string>();

    private lastXTranslate = 0;
    private lastYTranslate = 0;

    constructor(
        private renderer: Renderer2,
        private objectList: SVGElement[],
    ) {
        for (const obj of this.objectList) {
            const transform: string | null = obj.getAttribute('transform');
            if (transform) {
                this.previousTransformation.set(obj.id, transform);
            } else {
                this.previousTransformation.set(obj.id, '');
            }
        }
    }

    translate(xTranslate: number, yTranslate: number): void {
        this.lastXTranslate = xTranslate; this.lastYTranslate = yTranslate;
        const translateString = ` translate(${xTranslate} ${yTranslate})`;
        for (const obj of this.objectList) {
            this.renderer.setAttribute(obj,
                'transform', translateString + this.previousTransformation.get(obj.id) as string);
        }
    }

    undo(): void {
        for (const obj of this.objectList) {
            this.renderer.setAttribute(obj, 'transform', this.previousTransformation.get(obj.id) as string);
        }
    }

    execute(): void {
        this.translate(this.lastXTranslate, this.lastYTranslate);
    }

}
