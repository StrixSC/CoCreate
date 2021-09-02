import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';

export class RotateOnItselfCommand implements ICommand {
    private previousTransformation: Map<string, string> = new Map<string, string>();

    private objectsBoundingBox: Map<string, DOMRect | ClientRect> = new Map<string, DOMRect>();

    private lastAngle = 0;

    constructor(
        private renderer: Renderer2,
        private objectList: SVGElement[],
        private xFactor: number,
    ) {
        for (const obj of this.objectList) {
            const objBox = obj.getBoundingClientRect();
            this.objectsBoundingBox.set(obj.id, objBox);

            const transform: string | null = obj.getAttribute('transform');
            if (transform) {
                this.previousTransformation.set(obj.id, transform);
            } else {
                this.previousTransformation.set(obj.id, '');
            }
        }
    }

    rotate(angle: number): void {
        this.lastAngle = angle;

        for (const obj of this.objectList) {
            const lastTransformation = this.previousTransformation.get(obj.id) as string;
            const objBox = this.objectsBoundingBox.get(obj.id) as DOMRect;
            const xTranslate = objBox.left + objBox.width / 2 - this.xFactor;
            const yTranslate = objBox.top + objBox.height / 2;
            const rotateString = ` rotate(${angle} ${xTranslate} ${yTranslate})`;
            this.renderer.setAttribute(obj, 'transform', rotateString + lastTransformation);
        }
    }

    undo(): void {
        for (const obj of this.objectList) {
            this.renderer.setAttribute(obj, 'transform', this.previousTransformation.get(obj.id) as string);
        }
    }

    execute(): void {
        this.rotate(this.lastAngle);
    }

}
