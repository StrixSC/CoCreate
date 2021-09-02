import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ColorApplierCommand } from './color-applier-command';

describe('ColorApplierCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: Renderer2 };
    let colorApplierCommand: ColorApplierCommand;
    let el: SVGRectElement;
    let tempEl: HTMLElement;
    let markerEl: HTMLElement;

    beforeEach(() => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [
                RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererServiceSpy = TestBed.get(RendererProviderService);

        drawingServiceSpy.addObject.and.returnValue(1);

        el = rendererServiceSpy.renderer.createElement('rect', 'svg') as SVGRectElement;
        rendererServiceSpy.renderer.setAttribute(el, 'name', 'rectangle');
        rendererServiceSpy.renderer.setStyle(el, 'fill', 'rgb(100,200,200)');
        rendererServiceSpy.renderer.setStyle(el, 'fillOpacity', '0.5');
        rendererServiceSpy.renderer.setStyle(el, 'stroke', 'rgb(50,10,150)');
        rendererServiceSpy.renderer.setStyle(el, 'strokeOpacity', '0.2');

        tempEl = rendererServiceSpy.renderer.createElement('rect', 'svg');
        rendererServiceSpy.renderer.setAttribute(tempEl, 'name', 'rectangle');
        rendererServiceSpy.renderer.setProperty(tempEl, 'id', 'id');
        rendererServiceSpy.renderer.setStyle(tempEl, 'fill', 'rgb(120,160,20)');
        rendererServiceSpy.renderer.setStyle(tempEl, 'fillOpacity', '0.7');
        rendererServiceSpy.renderer.setStyle(tempEl, 'stroke', 'rgb(55,100,15)');
        rendererServiceSpy.renderer.setStyle(tempEl, 'strokeOpacity', '0.3');

        markerEl = rendererServiceSpy.renderer.createElement('rect', 'svg');
        rendererServiceSpy.renderer.setAttribute(tempEl, 'name', 'rectangle');
        rendererServiceSpy.renderer.setProperty(tempEl, 'id', 'mark');
        rendererServiceSpy.renderer.setStyle(tempEl, 'fill', 'rgb(120,160,20)');
        rendererServiceSpy.renderer.setStyle(tempEl, 'fillOpacity', '0.7');
        rendererServiceSpy.renderer.setStyle(tempEl, 'stroke', 'rgb(55,100,15)');
        rendererServiceSpy.renderer.setStyle(tempEl, 'strokeOpacity', '0.3');
        markerEl.appendChild(rendererServiceSpy.renderer.createElement('rect', 'svg'));
    });

    it('should be created', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        expect(colorApplierCommand).toBeTruthy();
    });

    it('#execute should change primary color', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(20, 100, 100)');
        expect(el.style.fillOpacity).toEqual('1');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#execute should change secondary color', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'secondaryColor', 'secondaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(20, 100, 100)');
        expect(el.style.strokeOpacity).toEqual('1');
    });

    it('#execute should not change primary color if name is undefined', () => {
        rendererServiceSpy.renderer.removeAttribute(el, 'name');
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#execute should not change primary color if name is not available', () => {
        rendererServiceSpy.renderer.setAttribute(el, 'name', 'notDefined');
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#execute should not change primary color if name is url is pointing to undefined', () => {
        rendererServiceSpy.renderer.setStyle(el, 'fill', 'url(#whatever)');
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('url("#whatever")');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#execute should not change primary color if name is url but change url element', () => {
        rendererServiceSpy.renderer.setStyle(el, 'fill', 'url("#id")');
        const spy = spyOn(document, 'getElementById').withArgs('id').and.returnValue(tempEl);
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(tempEl.style.fill).toEqual('rgb(20, 100, 100)');
        expect(tempEl.style.fillOpacity).toEqual('1');
        spy.calls.reset();
    });

    it('#execute should not change primary color if name is url but change url element with undefined name', () => {
        rendererServiceSpy.renderer.setStyle(el, 'fill', 'url("#id")');
        rendererServiceSpy.renderer.removeAttribute(tempEl, 'name');
        const spy = spyOn(document, 'getElementById').withArgs('id').and.returnValue(tempEl);
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(tempEl.style.fill).toEqual('rgb(20, 100, 100)');
        expect(tempEl.style.fillOpacity).toEqual('1');
        spy.calls.reset();
    });

    it('#execute should change primary color and marker color if marker exist', () => {
        rendererServiceSpy.renderer.setAttribute(el, 'marker-mid', 'url(#marker-mid)');
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(20, 100, 100)');
        expect(el.style.fillOpacity).toEqual('1');
    });

    it('#execute should change primary color and marker color', () => {
        rendererServiceSpy.renderer.setAttribute(el, 'marker-mid', 'url(#mark)');
        const spy = spyOn(document, 'getElementById').withArgs('mark').and.returnValue(markerEl);
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        expect(el.style.fill).toEqual('rgb(20, 100, 100)');
        expect(el.style.fillOpacity).toEqual('1');
        expect((markerEl.firstChild as HTMLElement).style.fill).toEqual('rgb(20, 100, 100)');
        expect((markerEl.firstChild as HTMLElement).style.fillOpacity).toEqual('1');
        spy.calls.reset();
    });

    it('#undo should change back primary color', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'primaryColor', 'primaryOpacity');
        colorApplierCommand.execute();
        colorApplierCommand.undo();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#undo should change back secondary color', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'secondaryColor', 'secondaryOpacity');
        colorApplierCommand.execute();
        colorApplierCommand.undo();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

    it('#undo without execute should do nothing', () => {
        colorApplierCommand = new ColorApplierCommand(
            rendererServiceSpy.renderer, el,
            'rgb(20,100,100)', 1,
            'secondaryColor', 'secondaryOpacity');
        colorApplierCommand.undo();
        expect(el.style.fill).toEqual('rgb(100, 200, 200)');
        expect(el.style.fillOpacity).toEqual('0.5');
        expect(el.style.stroke).toEqual('rgb(50, 10, 150)');
        expect(el.style.strokeOpacity).toEqual('0.2');
    });

});
