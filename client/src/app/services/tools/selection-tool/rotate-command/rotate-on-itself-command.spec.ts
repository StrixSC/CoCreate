import { TestBed } from '@angular/core/testing';

import { Renderer2 } from '@angular/core';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { RotateOnItselfCommand } from './rotate-on-itself-command';

describe('RotateOnItselfCommand', () => {
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };

    let svgRect: SVGRectElement;
    const svgID = 1;

    const angle = 100; let xT = 2; let yT = 3;
    let rotateString: string;

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
        spyOn(svgRect, 'getBoundingClientRect').and.returnValue(new DOMRect(1, 2, 40, 50));
        xT = 21; yT = 27;
        rotateString = ` rotate(${angle} ${xT} ${yT})`;
    });

    it('should be created', () => {
        const spy = spyOn(svgRect, 'getAttribute');
        const rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [svgRect], 0);
        expect(rotateOnItselfCommandMock).toBeTruthy();
        expect(spy).toHaveBeenCalledWith('transform');
    });

    it('#rotate should set the transfrom attribute of the object and have 2 attribute in transform', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [svgRect], 0);

        rotateOnItselfCommandMock.rotate(angle);

        expect(rotateOnItselfCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#rotate should set the transfrom attribute of the object and have 1 attribute in transform', () => {
        spyOn(svgRect, 'getAttribute').and.returnValue(null);
        const rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [svgRect], 0);

        rotateOnItselfCommandMock.rotate(angle);

        expect(rotateOnItselfCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#undo should set the transfrom attribute of the object to the transformation before the translate', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [svgRect], 0);

        rotateOnItselfCommandMock.rotate(angle);
        rendererSpy.setAttribute.calls.reset();
        rotateOnItselfCommandMock.undo();

        expect(rotateOnItselfCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });

    it('#execute should redo the transfrom attribute of the object to the transformation before the undo', () => {
        const attrib = ' rotate(0 1)';
        spyOn(svgRect, 'getAttribute').and.returnValue(attrib);
        const rotateOnItselfCommandMock = new RotateOnItselfCommand(rendererSpy, [svgRect], 0);

        rotateOnItselfCommandMock.rotate(angle);
        rotateOnItselfCommandMock.undo();
        rendererSpy.setAttribute.calls.reset();
        rotateOnItselfCommandMock.execute();

        expect(rotateOnItselfCommandMock).toBeTruthy();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith(svgRect, 'transform', rotateString + attrib);
        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(1);
    });
});
