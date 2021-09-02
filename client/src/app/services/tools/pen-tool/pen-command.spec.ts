import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Pencil } from '../pencil-tool/pencil.model';
import { PenCommand } from './pen-command';

describe('PenCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let penCommand: PenCommand;
    let pen: Pencil;

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
        pen = {
            pointsList: [{ x: 10, y: 12 }],
            strokeWidth: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',
        };
    });

    it('should be created', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        expect(penCommand).toBeTruthy();
    });

    it('#getDot should return the created dot', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        expect(penCommand.getDot()).toBeTruthy();
        expect(penCommand.getPen()).toBeNull();
    });

    it('#execute should create dot svg', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        const d = penCommand.getDot() as SVGCircleElement;
        expect(d.getAttribute('cx')).toEqual(pen.pointsList[0].x.toString());
        expect(d.getAttribute('cy')).toEqual(pen.pointsList[0].y.toString());
        expect(d.getAttribute('r')).toEqual((pen.strokeWidth / 2).toString() + 'px');
        expect(d.getAttribute('name')).toEqual('dot');
        expect(d.style.fill).toEqual(pen.stroke);
        expect(d.style.fillOpacity).toEqual(pen.strokeOpacity);
        expect(d.style.stroke).toEqual('none');
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(d);
    });

    it('#execute should create pen svg', () => {
        pen.pointsList.push({ x: 20, y: 40 });
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        const p = penCommand.getPen() as SVGGElement;
        expect(p.getAttribute('name')).toEqual('pen');
        expect(p.style.strokeLinecap).toEqual('round');
        expect(p.style.strokeLinejoin).toEqual('round');
        expect(p.style.fill).toEqual(pen.fill);
        expect(p.style.fillOpacity).toEqual(pen.fillOpacity);
        expect(p.style.stroke).toEqual(pen.stroke);
        expect(p.style.opacity).toEqual(pen.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(p);
    });

    it('#execute should not recreate dot svg', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        penCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#execute shold not recreate pen svg', () => {
        pen.pointsList.push({ x: 20, y: 40 });
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        penCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#undo should delete dot svg', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        penCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should delete pen svg', () => {
        pen.pointsList.push({ x: 20, y: 40 });
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        penCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#addPoint after the execute command remove dot and create pen', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        penCommand.addPoint(2, 2, 8);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(penCommand.getDot()).toBeNull();
        const p = penCommand.getPen() as SVGGElement;
        expect(p).toBeDefined();
    });

    it('#addPoint after the execute command should only update pen', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.execute();
        penCommand.addPoint(2, 2, 8);
        const spy = spyOn(penCommand, 'execute');
        penCommand.addPoint(2, 2, 8);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#addPoint before the execute command should update nothing', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        penCommand.addPoint(2, 2, 8);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#createPathElements after the execute command should create path elements', () => {
        penCommand = new PenCommand(
            rendererServiceSpy.renderer, pen, drawingServiceSpy);
        penCommand.addPoint(2, 2, 8);
        penCommand.execute();
        penCommand.addPoint(2, 2, 8);
        const p = penCommand.getPen() as SVGGElement;
        const penPath = p.lastChild as SVGPathElement;
        expect(penPath).toBeDefined();
        expect(penPath.getAttribute('name')).toEqual('pen');
        expect(penPath.getAttribute('d')).toEqual('M 12 14 L 14 16');
        expect(penPath.style.strokeWidth).toEqual('8px');
    });
});
