import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { CopyPasteOffsetService } from './copy-paste-offset.service';

/// Commande pour effectuer la duplication et le coller d'objets
export class PasteDuplicateCommand implements ICommand {

    private defsList: Map<string, SVGElement> = new Map<string, SVGElement>();
    private lastOffset: { x: number, y: number };

    constructor(
        private renderer: Renderer2,
        private drawingService: DrawingService,
        private copyPasteOffsetService: CopyPasteOffsetService,
        private objectList: SVGElement[],
        private isPaste: boolean,
    ) {
        isPaste ?
            this.lastOffset = Object.assign({}, this.copyPasteOffsetService.pasteOffset) :
            this.lastOffset = Object.assign({}, this.copyPasteOffsetService.duplicateOffset);
    }

    getObjectList(): SVGElement[] {
        return this.objectList;
    }
    /// Retire les objets qui ont été collé
    undo(): void {
        this.isPaste ?
            this.copyPasteOffsetService.pasteOffset = {
                x: this.lastOffset.x - this.copyPasteOffsetService.OFFSET_CONST,
                y: this.lastOffset.y - this.copyPasteOffsetService.OFFSET_CONST,
            } :
            this.copyPasteOffsetService.duplicateOffset = {
                x: this.lastOffset.x - this.copyPasteOffsetService.OFFSET_CONST,
                y: this.lastOffset.y - this.copyPasteOffsetService.OFFSET_CONST,
            };
        for (const obj of this.objectList) {
            this.drawingService.removeObject(Number(obj.id));
        }
        for (const obj of this.defsList) {
            this.drawingService.removeObject(Number(obj[1].id));
        }
    }

    /// Applique la fonctionnalité de coller l'objet
    execute(): void {
        if (this.isPaste) {
            this.copyPasteOffsetService.pasteOffset = this.lastOffset;
        } else {
            if (this.copyPasteOffsetService.offsetInit.x + this.copyPasteOffsetService.OFFSET_CONST > this.drawingService.width
                || this.copyPasteOffsetService.offsetInit.y + this.copyPasteOffsetService.OFFSET_CONST > this.drawingService.height) {
                this.lastOffset = { x: 0, y: 0 };
            }
            this.copyPasteOffsetService.duplicateOffset = this.lastOffset;
        }
        this.pasteDuplicate();
    }
    /// Logique pour coller des objets
    private pasteDuplicate(): void {
        if (this.objectList.length > 0) {
            this.objectList.forEach((clone) => {
                if (clone.id === '') {
                    const transform = clone.getAttribute('transform');
                    if (transform) {
                        clone.setAttribute('transform',
                            `translate(${this.lastOffset.x},${this.lastOffset.y}) ${transform}`);
                    } else {
                        clone.setAttribute('transform',
                            `translate(${this.lastOffset.x},${this.lastOffset.y})`);
                    }
                }

                const newId: number = this.drawingService.addObject(clone);
                const defObj: any = this.defsList.get(newId.toString());
                defObj ?
                    this.drawingService.addObject(defObj) :
                    this.setNewUrl(clone, newId.toString());
            });
        }
    }

    /// Logique pour creer de nouvelles references aux objets
    private setNewUrl(object: SVGElement, newId: string): void {
        let positionStart = object.outerHTML.indexOf('url(#', 0);
        if (positionStart !== -1) {
            const positionEnd: number = object.outerHTML.indexOf(')', positionStart);
            const urlId: string = object.outerHTML.substring(positionStart + 5, positionEnd);

            const elementClone: SVGElement = (document.getElementById(urlId) as HTMLElement).cloneNode(true) as SVGElement;
            elementClone.id = elementClone.id.substring(0, elementClone.id.length - 1) + newId;

            const defElement: SVGDefsElement = this.renderer.createElement('defs', 'svg');
            this.renderer.setAttribute(defElement, 'pointer-events', 'none');
            this.renderer.appendChild(defElement, elementClone);

            this.drawingService.addObject(defElement);
            this.defsList.set(newId, defElement);

            let outerHtmlString: string = object.outerHTML;
            while (positionStart !== -1) {
                const elementPosition: number = outerHtmlString.search(/\S+="url\(#/g);

                const partToAdd: string = outerHtmlString.substring(elementPosition, positionStart - 2);

                object.setAttribute(partToAdd, `url(#${elementClone.id})`);

                outerHtmlString = outerHtmlString.slice(positionStart + 5);
                positionStart = outerHtmlString.indexOf('url(#');
            }
        }
    }
}
