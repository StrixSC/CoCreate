import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { ResizeCommand } from './resize-command';

describe('ResizeCommand', () => {
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };

    let svgRect: SVGRectElement;
    const svgID = 1;

    const xS = 0; const yS = 1; const xT = 2; const yT = 3;
    const scaleString = ` translate(${xT} ${yT}) scale(${xS} ${yS}) translate(${-xT} ${-yT})`;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['setAttribute']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: RendererProviderService, useValue: rendererServiceSpy },
            ],
        });

        svgRect = document.createElement('rect') as Element as SVGRectElement;
        svgRect.id = `${svgID}`;
    });

    it('should be created', () => {
        const spy = spyOn(svgRect, 'getAttribute');
        const resizeCommandMock = new ResizeCommand(rendererSpy, [svgRect]);
        expect(resizeCommandMock).toBeTruthy();
        expect(spy).toHaveBeenCalledWith('transform');
    });

    it('#resize should set the transfrom attribute of the object and have 2 attribute in transform', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const resizeCommandMock = new ResizeCommand(rendererSpy, [svgRect]);

        resizeCommandMock.resize(xS, yS, xT, yT);

        expect(resizeCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', scaleString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#resize should set the transfrom attribute of the object and have 1 attribute in transform', () => {
        spyOn(svgRect, 'getAttribute').and.returnValue(null);
        const resizeCommandMock = new ResizeCommand(rendererSpy, [svgRect]);

        resizeCommandMock.resize(xS, yS, xT, yT);

        expect(resizeCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', scaleString);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#undo should set the transfrom attribute of the object to the transformation before the translate', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const resizeCommandMock = new ResizeCommand(rendererSpy, [svgRect]);

        resizeCommandMock.resize(xS, yS, xT, yT);
        rendererSpy.setAttribute.calls.reset();
        resizeCommandMock.undo();

        expect(resizeCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#execute should redo the transfrom attribute of the object to the transformation before the undo', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const resizeCommandMock = new ResizeCommand(rendererSpy, [svgRect]);

        resizeCommandMock.resize(xS, yS, xT, yT);
        resizeCommandMock.undo();
        rendererSpy.setAttribute.calls.reset();
        resizeCommandMock.execute();

        expect(resizeCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', scaleString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });
});
