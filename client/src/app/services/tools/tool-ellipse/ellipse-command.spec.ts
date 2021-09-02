import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { FilledShape } from '../tool-rectangle/filed-shape.model';
import { EllipseCommand } from './ellipse-command';

describe('EllipseCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let ellipseCommand: EllipseCommand;
    let ellipse: FilledShape;

    beforeEach(() => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererServiceSpy = TestBed.get(RendererProviderService);

        drawingServiceSpy.addObject.and.returnValue(1);
        ellipse = {
            x: 10,
            y: 12,
            width: 100,
            height: 150,
            strokeWidth: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',
        };
    });

    it('should be created', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        expect(ellipseCommand).toBeTruthy();
    });

    it('#getEllipse should return the created ellipse', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        expect(ellipseCommand.getEllipse()).toBeTruthy();
    });

    it('#execute should create ellipse svg', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        const rect = ellipseCommand.getEllipse();
        expect(rect.getAttribute('cx')).toEqual(ellipse.x.toString() + 'px');
        expect(rect.getAttribute('cy')).toEqual(ellipse.y.toString() + 'px');
        expect(rect.getAttribute('width')).toEqual(ellipse.width.toString() + 'px');
        expect(rect.getAttribute('height')).toEqual(ellipse.height.toString() + 'px');
        expect(rect.getAttribute('rx')).toEqual((ellipse.width / 2).toString() + 'px');
        expect(rect.getAttribute('ry')).toEqual((ellipse.height / 2).toString() + 'px');
        expect(rect.style.strokeWidth).toEqual(ellipse.strokeWidth.toString() + 'px');
        expect(rect.style.fill).toEqual(ellipse.fill);
        expect(rect.style.fillOpacity).toEqual(ellipse.fillOpacity);
        expect(rect.style.stroke).toEqual(ellipse.stroke);
        expect(rect.style.strokeOpacity).toEqual(ellipse.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(rect);
    });

    it('#undo should delete ellipse svg', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo before execute should do nothing', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });

    it('#execute after one execute should not ellipse svg', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.undo();
        const spy = spyOn(rendererServiceSpy.renderer, 'createElement');
        ellipseCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setWidth after the execute command should update width', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.setWidth(500);
        const rect = ellipseCommand.getEllipse();
        expect(rect.getAttribute('width')).toEqual('500px');
        expect(rect.getAttribute('rx')).toEqual('250px');
    });

    it('#setHeight after the execute command should update height', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.setHeight(500);
        const rect = ellipseCommand.getEllipse();
        expect(rect.getAttribute('height')).toEqual('500px');
        expect(rect.getAttribute('ry')).toEqual('250px');
    });

    it('#setCX after the execute command should update cx', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.setCX(500);
        const rect = ellipseCommand.getEllipse();
        expect(rect.getAttribute('cx')).toEqual('500px');
    });

    it('#setCY after the execute command should update cy', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        ellipseCommand.execute();
        ellipseCommand.setCY(500);
        const rect = ellipseCommand.getEllipse();
        expect(rect.getAttribute('cy')).toEqual('500px');
    });

    it('#setWidth after the execute should do nothing', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        ellipseCommand.setWidth(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setHeight after the execute should do nothing', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        ellipseCommand.setHeight(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setCX after the execute should do nothing', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        ellipseCommand.setCX(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setCY after the execute should do nothing', () => {
        ellipseCommand = new EllipseCommand(
            rendererServiceSpy.renderer, ellipse, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        ellipseCommand.setCY(500);
        expect(spy).not.toHaveBeenCalled();
    });
});
