import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { PolygonCommand } from './polygon-command';
import { Polygon } from './polygon.model';

describe('polygonCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let polygonCommand: PolygonCommand;
    let polygon: Polygon;

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
        polygon = {
            pointsList: [{ x: 10, y: 12 }, { x: 20, y: 12 }, { x: 20, y: 22 }, { x: 10, y: 22 }],
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
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        expect(polygonCommand).toBeTruthy();
    });

    it('#getPolygon should return the created rectangle', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        expect(polygonCommand.getPolygon()).toBeTruthy();
    });

    it('#execute should create polygon svg', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        const poly = polygonCommand.getPolygon();
        expect(poly.getAttribute('x')).toEqual(polygon.x.toString() + 'px');
        expect(poly.getAttribute('y')).toEqual(polygon.y.toString() + 'px');
        expect(poly.getAttribute('width')).toEqual(polygon.width.toString() + 'px');
        expect(poly.getAttribute('height')).toEqual(polygon.height.toString() + 'px');
        expect(poly.getAttribute('points')).toEqual('10 12,20 12,20 22,10 22');
        expect(poly.style.strokeWidth).toEqual(polygon.strokeWidth.toString() + 'px');
        expect(poly.style.fill).toEqual(polygon.fill);
        expect(poly.style.fillOpacity).toEqual(polygon.fillOpacity);
        expect(poly.style.stroke).toEqual(polygon.stroke);
        expect(poly.style.strokeOpacity).toEqual(polygon.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(poly);
    });

    it('#undo should delete polygon svg', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        polygonCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#resize after the execute command should resize points and size', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        polygonCommand.resize([{ x: 0, y: 10 }, { x: 50, y: 80 }, { x: 60, y: 30 }]);
        const poly = polygonCommand.getPolygon();
        expect(poly.getAttribute('x')).toEqual('0px');
        expect(poly.getAttribute('y')).toEqual('10px');
        expect(poly.getAttribute('width')).toEqual('60px');
        expect(poly.getAttribute('height')).toEqual('70px');
        expect(poly.getAttribute('points')).toEqual('0 10,50 80,60 30');
    });

    it('#resize before the execute command should resize points and size', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.resize([{ x: 0, y: 10 }, { x: 50, y: 80 }, { x: 60, y: 30 }]);
        polygonCommand.execute();
        const poly = polygonCommand.getPolygon();
        expect(poly.getAttribute('x')).toEqual('0px');
        expect(poly.getAttribute('y')).toEqual('10px');
        expect(poly.getAttribute('width')).toEqual('60px');
        expect(poly.getAttribute('height')).toEqual('70px');
        expect(poly.getAttribute('points')).toEqual('0 10,50 80,60 30');
    });

    it('#resize with empty array should do nothing', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        polygonCommand.resize([]);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#undo should not delete polygon svg if polygon is undefined', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalledWith(0);
    });

    it('#execute should not recreate polygon svg if polygon is defined', () => {
        polygonCommand = new PolygonCommand(
            rendererServiceSpy.renderer, polygon, drawingServiceSpy);
        polygonCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'createElement');
        polygonCommand.execute();
        expect(spy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.addObject).toHaveBeenCalledTimes(2);
    });
});
