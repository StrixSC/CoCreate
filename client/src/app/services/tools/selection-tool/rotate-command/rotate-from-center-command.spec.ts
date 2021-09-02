import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { RotateFromCenterCommand } from './rotate-from-center-command';

describe('RotateFromCenterCommand', () => {
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };

    let svgRect: SVGRectElement;
    const svgID = 1;

    const angle = 100; const xT = 2; const yT = 3;
    const rotateString = ` rotate(${angle} ${xT} ${yT})`;

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
        const rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, [svgRect]);
        expect(rotateFromCenterCommandMock).toBeTruthy();
        expect(spy).toHaveBeenCalledWith('transform');
    });

    it('#rotate should set the transfrom attribute of the object and have 2 attribute in transform', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, [svgRect]);

        rotateFromCenterCommandMock.rotate(angle, xT, yT);

        expect(rotateFromCenterCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#rotate should set the transfrom attribute of the object and have 1 attribute in transform', () => {
        spyOn(svgRect, 'getAttribute').and.returnValue(null);
        const rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, [svgRect]);

        rotateFromCenterCommandMock.rotate(angle, xT, yT);

        expect(rotateFromCenterCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#undo should set the transfrom attribute of the object to the transformation before the translate', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, [svgRect]);

        rotateFromCenterCommandMock.rotate(angle, xT, yT);
        rendererSpy.setAttribute.calls.reset();
        rotateFromCenterCommandMock.undo();

        expect(rotateFromCenterCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#execute should redo the transfrom attribute of the object to the transformation before the undo', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateFromCenterCommandMock = new RotateFromCenterCommand(rendererSpy, [svgRect]);

        rotateFromCenterCommandMock.rotate(angle, xT, yT);
        rotateFromCenterCommandMock.undo();
        rendererSpy.setAttribute.calls.reset();
        rotateFromCenterCommandMock.execute();

        expect(rotateFromCenterCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });
});
