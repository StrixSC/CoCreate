import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { TranslateCommand } from './translate-command';

describe('TranslateCommand', () => {
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };

    let svgRect: SVGRectElement;
    const svgID = 1;

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
        const translateCommandMock = new TranslateCommand(rendererSpy, [svgRect]);
        expect(translateCommandMock).toBeTruthy();
        expect(spy).toHaveBeenCalledWith('transform');
    });

    it('#translate should set the transfrom attribute of the object and have 2 attribute in transform', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const translateCommandMock = new TranslateCommand(rendererSpy, [svgRect]);

        translateCommandMock.translate(2, 3);

        expect(translateCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', ` translate(${2} ${3})` + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#translate should set the transfrom attribute of the object and have 1 attribute in transform', () => {
        spyOn(svgRect, 'getAttribute').and.returnValue(null);
        const translateCommandMock = new TranslateCommand(rendererSpy, [svgRect]);

        translateCommandMock.translate(2, 3);

        expect(translateCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', ` translate(${2} ${3})`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#undo should set the transfrom attribute of the object to the transformation before the translate', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const translateCommandMock = new TranslateCommand(rendererSpy, [svgRect]);

        translateCommandMock.translate(2, 3);
        rendererSpy.setAttribute.calls.reset();
        translateCommandMock.undo();

        expect(translateCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#execute should redo the transfrom attribute of the object to the transformation before the undo', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const translateCommandMock = new TranslateCommand(rendererSpy, [svgRect]);

        translateCommandMock.translate(2, 3);
        translateCommandMock.undo();
        rendererSpy.setAttribute.calls.reset();
        translateCommandMock.execute();

        expect(translateCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', ` translate(${2} ${3})` + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });
});
