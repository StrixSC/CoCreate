import { Renderer2 } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { OBJECT_ATTRIBUTE_STRUCTURE } from 'src/app/model/object-structure.model';
export class ColorApplierCommand implements ICommand {

    readonly renderer: Renderer2;
    private svgElement: SVGElement | HTMLElement;
    private newColor: string;
    private newAlpha: string;
    private previousColor: string;
    private previousAlpha: string;
    private colorAtribute: string;
    private additionalFeatherAttribute: string;
    private alphaAtribute: string;

    constructor(
        renderer: Renderer2,
        svgElement: SVGElement | HTMLElement,
        color: string,
        alpha: number,
        colorString: string,
        alphaString: string) {
        this.renderer = renderer;
        this.svgElement = svgElement;
        this.newColor = color;
        this.newAlpha = alpha.toString();
        const svgElementName: string | null = this.svgElement.getAttribute('name');
        if (!svgElementName) {
            return;
        }
        const propertyMap: Record<string, string> | undefined = OBJECT_ATTRIBUTE_STRUCTURE[svgElementName];
        if (!propertyMap) {
            return;
        }
        const actualValue = this.svgElement.style.getPropertyValue(propertyMap.primaryColor as string);

        /// Texture situation
        if (actualValue.startsWith('url')) {
            const textureElement = document.getElementById(actualValue.replace('url("#', '').replace('")', '')) as SVGElement | null;
            if (!textureElement) {
                return;
            }
            this.svgElement = textureElement as SVGElement;
        }
        const svgPropertyRecord: Record<string, string> = OBJECT_ATTRIBUTE_STRUCTURE[
            this.svgElement.getAttribute('name') ? this.svgElement.getAttribute('name') as string : 'rectangle'
        ] as Record<string, string>;
        this.colorAtribute = svgPropertyRecord[colorString] as string;
        this.alphaAtribute = svgPropertyRecord[alphaString] as string;
        this.previousColor = this.svgElement.style.getPropertyValue(this.colorAtribute);
        this.previousAlpha = this.svgElement.style.getPropertyValue(this.alphaAtribute);
        if (this.svgElement.getAttribute('name') === 'feather') {
            this.additionalFeatherAttribute = svgPropertyRecord.primaryColor2;
        }
    }

    undo(): void {
        this.changeColor(this.previousColor, this.previousAlpha);
    }
    execute(): void {
        this.changeColor(this.newColor, this.newAlpha);
    }

    private changeColor(color: string, alpha: string): void {
        this.renderer.setStyle(this.svgElement, this.colorAtribute, color);
        if (this.additionalFeatherAttribute) {
            this.renderer.setStyle(this.svgElement, this.additionalFeatherAttribute, color);

        }
        this.renderer.setStyle(this.svgElement, this.alphaAtribute, alpha);
        const markerID: string | null = this.svgElement.getAttribute('marker-mid');
        if (markerID) {
            const markerEl: HTMLElement | null = document.getElementById(
                markerID.replace('url(#', '').replace(')', ''));
            if (markerEl) {
                this.renderer.setStyle(markerEl.firstChild as SVGElement, 'fill', color);
                this.renderer.setStyle(markerEl.firstChild as SVGElement, 'fillOpacity', alpha);
            }
        }
    }
}
