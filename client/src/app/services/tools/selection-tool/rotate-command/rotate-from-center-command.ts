import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';

export class RotateFromCenterCommand implements ICommand {
    private previousTransformation: Map<string, string> = new Map<string, string>();

    private lastAngle = 0;
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

    rotate(angle: number, xTranslate: number, yTranslate: number): void {
        this.lastAngle = angle;
        this.lastXTranslate = xTranslate; this.lastYTranslate = yTranslate;
        const rotateString = ` rotate(${angle} ${xTranslate} ${yTranslate})`;

        for (const obj of this.objectList) {
            const lastTransformation = this.previousTransformation.get(obj.id) as string;
            this.renderer.setAttribute(obj, 'transform', rotateString + lastTransformation);
        }
    }

    undo(): void {
        for (const obj of this.objectList) {
            this.renderer.setAttribute(obj, 'transform', this.previousTransformation.get(obj.id) as string);
        }
    }

    execute(): void {
        this.rotate(this.lastAngle, this.lastXTranslate, this.lastYTranslate);
    }

}
