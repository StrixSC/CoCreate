import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { PencilCommand } from './pencil-command';
import { Pencil } from './pencil.model';

describe('PencilCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let pencilCommand: PencilCommand;
    let pencil: Pencil;

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
        pencil = {
            pointsList: [{ x: 10, y: 12 }],
            strokeWidth: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',
        };
    });

    it('should be created', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        expect(pencilCommand).toBeTruthy();
    });

    it('#getDot should return the created dot', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        expect(pencilCommand.getDot()).toBeTruthy();
        expect(pencilCommand.getPencil()).toBeNull();
    });

    it('#execute should create dot svg', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        const d = pencilCommand.getDot() as SVGCircleElement;
        expect(d.getAttribute('cx')).toEqual(pencil.pointsList[0].x.toString() + 'px');
        expect(d.getAttribute('cy')).toEqual(pencil.pointsList[0].y.toString() + 'px');
        expect(d.getAttribute('r')).toEqual((pencil.strokeWidth / 2).toString() + 'px');
        expect(d.getAttribute('name')).toEqual('dot');
        expect(d.style.fill).toEqual(pencil.stroke);
        expect(d.style.fillOpacity).toEqual(pencil.strokeOpacity);
        expect(d.style.stroke).toEqual('none');
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(d);
    });

    it('#execute should create pencil svg', () => {
        pencil.pointsList.push({ x: 20, y: 40 });
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        const p = pencilCommand.getPencil() as SVGPolylineElement;
        expect(p.getAttribute('points')).toEqual(
            `${pencil.pointsList[0].x} ${pencil.pointsList[0].y},${pencil.pointsList[1].x} ${pencil.pointsList[1].y}`);
        expect(p.getAttribute('name')).toEqual('pencil');
        expect(p.style.strokeWidth).toEqual(pencil.strokeWidth.toString() + 'px');
        expect(p.style.strokeLinecap).toEqual('round');
        expect(p.style.strokeLinejoin).toEqual('round');
        expect(p.style.fill).toEqual(pencil.fill);
        expect(p.style.fillOpacity).toEqual(pencil.fillOpacity);
        expect(p.style.stroke).toEqual(pencil.stroke);
        expect(p.style.strokeOpacity).toEqual(pencil.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(p);
    });

    it('#execute should not recreate dot svg', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        pencilCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#execute shold not recreate pencil svg', () => {
        pencil.pointsList.push({ x: 20, y: 40 });
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        pencilCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#undo should delete dot svg', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        pencilCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should delete pencil svg', () => {
        pencil.pointsList.push({ x: 20, y: 40 });
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        pencilCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#addPoint after the execute command should update point remove dot and create pencil', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        pencilCommand.addPoint({ x: 30, y: 40 });
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(pencilCommand.getDot()).toBeNull();
        const p = pencilCommand.getPencil() as SVGPolylineElement;
        expect(p).toBeDefined();
        expect(p.getAttribute('points')).toEqual('10 12,30 40');
    });

    it('#addPoint after the execute command should only update pencil', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        pencilCommand.execute();
        pencilCommand.addPoint({ x: 30, y: 40 });
        const spy = spyOn(pencilCommand, 'execute');
        pencilCommand.addPoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
        const p = pencilCommand.getPencil() as SVGPolylineElement;
        expect(p.getAttribute('points')).toEqual('10 12,30 40,30 40');
    });

    it('#addPoint before the execute command should update nothing', () => {
        pencilCommand = new PencilCommand(
            rendererServiceSpy.renderer, pencil, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        pencilCommand.addPoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
    });
});
