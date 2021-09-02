import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { FilledShape } from './filed-shape.model';
import { RectangleCommand } from './rectangle-command';

describe('RectangleCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let rectangleCommand: RectangleCommand;
    let rectangle: FilledShape;

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
        rectangle = {
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
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        expect(rectangleCommand).toBeTruthy();
    });

    it('#getRectangle should return the created rectangle', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        expect(rectangleCommand.getRectangle()).toBeTruthy();
    });

    it('#execute should create rectangle svg', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        const rect = rectangleCommand.getRectangle();
        expect(rect.getAttribute('x')).toEqual(rectangle.x.toString() + 'px');
        expect(rect.getAttribute('y')).toEqual(rectangle.y.toString() + 'px');
        expect(rect.getAttribute('width')).toEqual(rectangle.width.toString() + 'px');
        expect(rect.getAttribute('height')).toEqual(rectangle.height.toString() + 'px');
        expect(rect.style.strokeWidth).toEqual(rectangle.strokeWidth.toString() + 'px');
        expect(rect.style.fill).toEqual(rectangle.fill);
        expect(rect.style.fillOpacity).toEqual(rectangle.fillOpacity);
        expect(rect.style.stroke).toEqual(rectangle.stroke);
        expect(rect.style.strokeOpacity).toEqual(rectangle.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(rect);
    });

    it('#undo should delete rectangle svg', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo without execute should do nothing', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });

    it('#execute after one execute should not recreate rectangle svg', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.undo();
        const spy = spyOn(rendererServiceSpy.renderer, 'createElement');
        rectangleCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setWidth after the execute command should update width', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.setWidth(500);
        const rect = rectangleCommand.getRectangle();
        expect(rect.getAttribute('width')).toEqual('500px');
    });

    it('#setHeight after the execute command should update height', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.setHeight(500);
        const rect = rectangleCommand.getRectangle();
        expect(rect.getAttribute('height')).toEqual('500px');
    });

    it('#setX after the execute command should update x', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.setX(500);
        const rect = rectangleCommand.getRectangle();
        expect(rect.getAttribute('x')).toEqual('500px');
    });

    it('#setY after the execute command should update y', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        rectangleCommand.execute();
        rectangleCommand.setY(500);
        const rect = rectangleCommand.getRectangle();
        expect(rect.getAttribute('y')).toEqual('500px');
    });

    it('#setWidth after the execute should do nothing', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        rectangleCommand.setWidth(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setHeight after the execute should do nothing', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        rectangleCommand.setHeight(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setX after the execute should do nothing', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        rectangleCommand.setX(500);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#setY after the execute should do nothing', () => {
        rectangleCommand = new RectangleCommand(
            rendererServiceSpy.renderer, rectangle, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        rectangleCommand.setY(500);
        expect(spy).not.toHaveBeenCalled();
    });
});
