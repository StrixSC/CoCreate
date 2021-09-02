import { Renderer2 } from '@angular/core';
import { RGBA } from 'src/app/model/rgba.model';
import { Texture } from '../../interfaces/texture.interface';
import { TEXTURE_FIVE } from './texture-id';

/// Classe avec les informations de la texture de texture five
/// Le pattern provient du site web https://www.heropatterns.com/
export class TextureFive implements Texture {
    readonly id: number = TEXTURE_FIVE;
    readonly name = 'Texture Five';
    readonly randomAngle = Math.round(Math.random() * 360);

    getTextureIDName(id: string): string {
        return `${this.id}-${id}`;
    }

    /// Retourne la ligne html du pattern
    getPattern(primaryColor: RGBA, id: string, x: number, y: number, renderer: Renderer2): SVGDefsElement {
        const texture: SVGDefsElement = renderer.createElement('defs', 'svg');
        renderer.setAttribute(texture, 'pointer-events', 'none');
        const pattern: SVGPatternElement = renderer.createElement('pattern', 'svg');
        renderer.setProperty(pattern, 'id', this.getTextureIDName(id));
        renderer.setAttribute(pattern, 'width', '4px');
        renderer.setAttribute(pattern, 'height', '4px');
        renderer.setAttribute(pattern, 'viewBox', '0 0 4 4');
        renderer.setAttribute(pattern, 'x', x.toString());
        renderer.setAttribute(pattern, 'y', y.toString());
        renderer.setAttribute(pattern, 'patternTransform', `rotate(${this.randomAngle})`);
        renderer.setAttribute(pattern, 'patternUnits', 'userSpaceOnUse');
        renderer.setAttribute(pattern, 'fill', `rgb(${primaryColor.rgb.r},${primaryColor.rgb.g},${primaryColor.rgb.b})`);
        renderer.setAttribute(pattern, 'fill-opacity', `${primaryColor.a}`);
        renderer.setAttribute(pattern, 'name', 'texture');
        const g: SVGGElement = renderer.createElement('g', 'svg');
        renderer.setAttribute(g, 'fill-rule', 'evenodd');
        const path: SVGPathElement = renderer.createElement('path', 'svg');
        renderer.setAttribute(path, 'd',
            `M1 3h1v1H1V3zm2-2h1v1H3V1z`);
        renderer.setProperty(path, 'id', 'Combined-Shape');
        renderer.appendChild(g, path);
        renderer.appendChild(pattern, g);
        renderer.appendChild(texture, pattern);
        return texture;
    }
}
