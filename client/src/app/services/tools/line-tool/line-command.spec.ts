import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { LineCommand } from './line-command';
import { Line } from './line.model';

describe('LineCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let lineCommand: LineCommand;
    let line: Line;

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
        line = {
            diameter: 12,
            markerId: 2,
            pointsList: [{ x: 10, y: 12 }],
            strokeWidth: 3,
            fill: 'black', stroke: 'blue',
            fillOpacity: '0.4', strokeOpacity: '1',
            strokeLinecap: 'round', strokeLinejoin: 'miter', strokeDasharray: '1',
            markerVisibility: 'hidden',
        };
    });

    it('should be created', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        expect(lineCommand).toBeTruthy();
    });

    it('#getLine should return the created line and #getMarkerDefs should not return marker if not defined', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        expect(lineCommand.getLine()).toBeDefined();
        expect(lineCommand.getMarkerDefs()).toBeUndefined();
    });

    it('#getLine should return the created line and #getMarkerDefs should not return marker if not defined', () => {
        line.markerVisibility = 'visible';
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        expect(lineCommand.getLine()).toBeDefined();
        expect(lineCommand.getMarkerDefs()).toBeDefined();
    });

    it('#execute should create line svg', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(`${line.pointsList[0].x} ${line.pointsList[0].y}`);
        expect(l.getAttribute('name')).toEqual('line');
        expect(l.style.strokeWidth).toEqual(line.strokeWidth.toString() + 'px');
        expect(l.style.fill).toEqual(line.fill);
        expect(l.style.fillOpacity).toEqual(line.fillOpacity);
        expect(l.style.stroke).toEqual(line.stroke);
        expect(l.style.strokeOpacity).toEqual(line.strokeOpacity);
        expect(l.style.strokeLinecap).toEqual(line.strokeLinecap);
        expect(l.style.strokeLinejoin).toEqual(line.strokeLinejoin);
        expect(l.style.strokeDasharray).toEqual(line.strokeDasharray + 'px');
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(l);
    });

    it('#execute should create line svg with marker', () => {
        line.markerVisibility = 'visible';
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        const l = lineCommand.getLine() as SVGPolylineElement;
        const m = (lineCommand.getMarkerDefs() as SVGDefsElement).firstChild as SVGMarkerElement;
        const c = m.firstChild as SVGCircleElement;
        expect(l.getAttribute('points')).toEqual(`${line.pointsList[0].x} ${line.pointsList[0].y}`);
        expect(l.getAttribute('name')).toEqual('line');
        expect(l.style.strokeWidth).toEqual(line.strokeWidth.toString() + 'px');
        expect(l.style.fill).toEqual(line.fill);
        expect(l.style.fillOpacity).toEqual(line.fillOpacity);
        expect(l.style.stroke).toEqual(line.stroke);
        expect(l.style.strokeOpacity).toEqual(line.strokeOpacity);
        expect(l.style.strokeLinecap).toEqual(line.strokeLinecap);
        expect(l.style.strokeLinejoin).toEqual(line.strokeLinejoin);
        expect(l.style.strokeDasharray).toEqual(line.strokeDasharray + 'px');

        expect(m.getAttribute('markerUnits')).toEqual('userSpaceOnUse');
        expect(m.getAttribute('markerHeight')).toEqual(line.diameter.toString() + 'px');
        expect(m.getAttribute('markerWidth')).toEqual(line.diameter.toString() + 'px');
        expect(m.getAttribute('viewBox')).toEqual(`0 0 ${line.diameter} ${line.diameter}`);
        expect(m.getAttribute('refX')).toEqual((line.diameter / 2).toString() + 'px');
        expect(m.getAttribute('refY')).toEqual((line.diameter / 2).toString() + 'px');
        expect(m.getAttribute('id')).toEqual(`${line.diameter}-Marker-${line.markerId}`);

        expect(c.getAttribute('cx')).toEqual((line.diameter / 2).toString() + 'px');
        expect(c.getAttribute('cy')).toEqual((line.diameter / 2).toString() + 'px');
        expect(c.getAttribute('r')).toEqual((line.diameter / 2).toString() + 'px');
        expect(c.getAttribute('visibility')).toEqual(line.markerVisibility);

        expect(c.style.fill).toEqual(line.stroke);
        expect(c.style.fillOpacity).toEqual(line.strokeOpacity);

        expect(l.getAttribute('marker-start')).toEqual(`url(#${line.diameter}-Marker-${line.markerId})`);
        expect(l.getAttribute('marker-mid')).toEqual(`url(#${line.diameter}-Marker-${line.markerId})`);
        expect(l.getAttribute('marker-end')).toEqual(`url(#${line.diameter}-Marker-${line.markerId})`);

        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(l);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(m.parentElement);
    });

    it('#undo should delete polyline svg', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should delete polyline svg and marker', () => {
        line.markerVisibility = 'visible';
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(2);
    });

    it('#undo should do nothing if there is no polyline', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });

    it('#execute should create only once the polyline', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.undo();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        lineCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#addPoint after the execute command should update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.addPoint({ x: 30, y: 40 });
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(`${line.pointsList[0].x} ${line.pointsList[0].y},30 40`);
    });

    it('#addPoint before the execute command should not update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        lineCommand.addPoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
    });

    it('#updatePoint after the execute command should update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.updatePoint({ x: 30, y: 40 });
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(`30 40`);
    });

    it('#updatePoint before the execute command should not update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        lineCommand.updatePoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
    });

    it('#removeLastPoint after the execute command should update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.removeLastPoint();
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(``);
    });

    it('#removeLastPoint before the execute command should not update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        lineCommand.removeLastPoint();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#finishLine after the execute command should update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.addPoint({ x: 30, y: 40 });
        lineCommand.finishLine(true);
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(
            `${line.pointsList[0].x} ${line.pointsList[0].y},${line.pointsList[0].x} ${line.pointsList[0].y}`);
    });

    it('#finishLine after the execute command should update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        lineCommand.execute();
        lineCommand.addPoint({ x: 30, y: 40 });
        lineCommand.finishLine(false);
        const l = lineCommand.getLine() as SVGPolylineElement;
        expect(l.getAttribute('points')).toEqual(
            `${line.pointsList[0].x} ${line.pointsList[0].y}`);
    });

    it('#finishLine before the execute command should not update transform', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        lineCommand.finishLine(true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#pointLength should return the length of the polygon points list', () => {
        lineCommand = new LineCommand(
            rendererServiceSpy.renderer, line, drawingServiceSpy);
        expect(lineCommand.pointsLength).toEqual(1);
        lineCommand.addPoint({ x: 10, y: 12 });
        expect(lineCommand.pointsLength).toEqual(2);
        lineCommand.removeLastPoint();
        expect(lineCommand.pointsLength).toEqual(1);
    });
});
