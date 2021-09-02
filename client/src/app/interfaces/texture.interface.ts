import { Renderer2 } from '@angular/core';
import { RGBA } from '../model/rgba.model';

export interface Texture {
    readonly id: number;
    readonly name: string;
    getTextureIDName(id: string): string;
    getPattern(primaryColor: RGBA, id: string, x: number, y: number, renderer: Renderer2): SVGDefsElement;
}
