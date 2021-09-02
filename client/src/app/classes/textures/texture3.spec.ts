import { Renderer2 } from '@angular/core';
import { RGBA } from '../../model/rgba.model';
import { TEXTURE_THREE } from './texture-id';
import { TextureThree } from './texture3';

describe('Texture3', () => {
    let textureThree: TextureThree;
    let renderer2Spy: jasmine.SpyObj<Renderer2>;
    renderer2Spy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild']);
    const id = '3';
    beforeEach(() => {
        textureThree = new TextureThree();
    });

    it('should be created', () => {
        expect(textureThree).toBeTruthy();
    });

    it('should return it id', () => {
        const idName: string = textureThree.getTextureIDName('2');
        expect(idName).toBe(TEXTURE_THREE + '-2');
    });

    it('should return the patern with the value inserted', () => {
        const idName: string = textureThree.getTextureIDName(id);
        const rgba: RGBA = { rgb: { r: 200, g: 123, b: 200 }, a: 1 };
        const x = 20;
        const y = 25;
        renderer2Spy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        renderer2Spy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        renderer2Spy.createElement.withArgs('g', 'svg').and.returnValue('g');
        renderer2Spy.createElement.withArgs('path', 'svg').and.returnValue('path');
        textureThree.getPattern(rgba, idName, x, y, renderer2Spy);
        expect(renderer2Spy.setProperty).toHaveBeenCalledWith('pattern', 'id', TEXTURE_THREE + '-' + idName);
        expect(renderer2Spy.setAttribute).toHaveBeenCalledWith('pattern', 'x', x.toString());
        expect(renderer2Spy.setAttribute).toHaveBeenCalledWith('pattern', 'y', y.toString());
        expect(renderer2Spy.setAttribute).toHaveBeenCalledWith('pattern', 'fill', `rgb(${rgba.rgb.r},${rgba.rgb.g},${rgba.rgb.b})`);
        expect(renderer2Spy.setAttribute).toHaveBeenCalledWith('pattern', 'fill-opacity', `${rgba.a}`);
    });
});
