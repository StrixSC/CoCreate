import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';

const NOT_FOUND = -1;

export class EraserCommand implements ICommand {
  private markerDef: SVGDefsElement[] = [];
  private drawingService: DrawingService;
  private elementToErase: Map<string, SVGElement> = new Map<string, SVGElement>();

  constructor(
    eraserAttributes: Map<string, SVGElement>,
    drawingService: DrawingService,
  ) {

    this.drawingService = drawingService;
    for (const i of eraserAttributes) {
      this.elementToErase.set(i[0], i[1]);
    }
  }

  execute(): void {
    this.elementToErase.forEach((value: SVGElement, key: string) => {
      this.drawingService.removeObject(Number(key));
      const positionStart: number = value.outerHTML.indexOf('url(#', 0);
      if (positionStart !== NOT_FOUND) {
        const positionEnd: number = value.outerHTML.indexOf(')', positionStart);
        const urlId: string = value.outerHTML.substring(positionStart + 5, positionEnd);
        const markerToRemove: SVGDefsElement = (document.getElementById(urlId) as Element).parentNode as SVGDefsElement;
        this.markerDef.push(markerToRemove);
        this.drawingService.removeObject(Number(markerToRemove.id));
      }
    });
  }
  undo(): void {
    this.elementToErase.forEach((value: SVGElement, key: string) => {
      this.drawingService.addObject(value);
    });
    for (const obj of this.markerDef) {
      this.drawingService.addObject(obj);
    }
  }
}
