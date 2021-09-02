import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';

export class ResizeCommand implements ICommand {
  private previousTransformation: Map<string, string> = new Map<string, string>();

  private lastXScaled = 1;
  private lastYScaled = 1;
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

  resize(xScaled: number, yScaled: number, xTranslate: number, yTranslate: number): void {
    this.lastXScaled = xScaled; this.lastYScaled = yScaled;
    this.lastXTranslate = xTranslate; this.lastYTranslate = yTranslate;
    const scaleString = ` translate(${xTranslate} ${yTranslate})`
      + ` scale(${xScaled} ${yScaled})`
      + ` translate(${-xTranslate} ${-yTranslate})`;

    for (const obj of this.objectList) {
      const lastTransformation = this.previousTransformation.get(obj.id) as string;
      this.renderer.setAttribute(obj, 'transform', scaleString + lastTransformation);
    }
  }

  undo(): void {
    for (const obj of this.objectList) {
      this.renderer.setAttribute(obj, 'transform', this.previousTransformation.get(obj.id) as string);
    }
  }

  execute(): void {
    this.resize(this.lastXScaled, this.lastYScaled, this.lastXTranslate, this.lastYTranslate);
  }

}
