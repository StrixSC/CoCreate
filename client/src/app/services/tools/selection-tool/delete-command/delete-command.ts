import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../../drawing/drawing.service';

/// Commande permettant le retrait d'une liste d'element svg du dessin
export class DeleteCommand implements ICommand {
    private markerDef: SVGElement[] = [];

    constructor(
        private drawingService: DrawingService,
        private objectList: SVGElement[],
    ) { }

    /// Rajout des elements suprimé
    undo(): void {
        for (const obj of this.objectList) {
            this.drawingService.addObject(obj);
        }
        for (const obj of this.markerDef) {
            this.drawingService.addObject(obj);
        }
    }

    /// Retrait des elements de la liste du dessin
    execute(): void {
        for (const obj of this.objectList) {
            this.drawingService.removeObject(Number(obj.id));

            const positionStart: number = obj.outerHTML.indexOf('url(#', 0);
            if (positionStart !== -1) {
                const positionEnd: number = obj.outerHTML.indexOf(')', positionStart);

                const urlId: string = obj.outerHTML.substring(positionStart + 5, positionEnd);
                const markerToRemove: SVGElement = (document.getElementById(urlId) as Element).parentNode as SVGElement;
                this.markerDef.push(markerToRemove);
                this.drawingService.removeObject(Number(markerToRemove.id));
            }
        }
    }
}
