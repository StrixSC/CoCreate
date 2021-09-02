import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Pencil } from '../pencil-tool/pencil.model';
import { BrushCommand } from './brush-command';

describe('BrushCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let brushCommand: BrushCommand;
    let brush: Pencil;
    let texture: SVGDefsElement;
    const textureId = 'texture-01';

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
        brush = {
            pointsList: [{ x: 10, y: 12 }],
            strokeWidth: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',
        };
        texture = document.createElementNS('svg', 'defs') as SVGDefsElement;
        const textureInformation = document.createElementNS('svg', 'pattern') as SVGPatternElement;
        textureInformation.id = textureId;
        texture.appendChild(textureInformation);
    });

    it('should be created', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        expect(brushCommand).toBeTruthy();
    });

    it('#getDot should return the created dot', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        expect(brushCommand.getDot()).toBeTruthy();
        expect(brushCommand.getBrush()).toBeNull();
    });

    it('#execute should create dot svg', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        const d = brushCommand.getDot() as SVGCircleElement;
        expect(d.getAttribute('cx')).toEqual(brush.pointsList[0].x.toString() + 'px');
        expect(d.getAttribute('cy')).toEqual(brush.pointsList[0].y.toString() + 'px');
        expect(d.getAttribute('r')).toEqual((brush.strokeWidth / 2).toString() + 'px');
        expect(d.getAttribute('name')).toEqual('dot');
        expect(d.getAttribute('fill')).toEqual(`url(#${textureId})`);
        expect(d.getAttribute('stroke')).toEqual('none');
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(d);
    });

    it('#execute should create pencil svg', () => {
        brush.pointsList.push({ x: 20, y: 40 });
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        const p = brushCommand.getBrush() as SVGPolylineElement;
        expect(p.getAttribute('points')).toEqual(
            `${brush.pointsList[0].x} ${brush.pointsList[0].y},${brush.pointsList[1].x} ${brush.pointsList[1].y}`);
        expect(p.getAttribute('name')).toEqual('brush');
        expect(p.style.strokeWidth).toEqual(brush.strokeWidth.toString() + 'px');
        expect(p.style.strokeLinecap).toEqual('round');
        expect(p.style.strokeLinejoin).toEqual('round');
        expect(p.getAttribute('fill')).toEqual(brush.fill);
        expect(p.style.fillOpacity).toEqual(brush.fillOpacity);
        expect(p.getAttribute('stroke')).toEqual(`url(#${textureId})`);
        expect(p.style.strokeOpacity).toEqual(brush.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(p);
    });

    it('#execute should not recreate dot svg', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        brushCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#execute shold not recreate pencil svg', () => {
        brush.pointsList.push({ x: 20, y: 40 });
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        brushCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#undo should delete dot svg', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        brushCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should delete pencil svg', () => {
        brush.pointsList.push({ x: 20, y: 40 });
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        brushCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#addPoint after the execute command should update point remove dot and create pencil', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        brushCommand.addPoint({ x: 30, y: 40 });
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
        expect(brushCommand.getDot()).toBeNull();
        const p = brushCommand.getBrush() as SVGPolylineElement;
        expect(p).toBeDefined();
        expect(p.getAttribute('points')).toEqual('10 12,30 40');
    });

    it('#addPoint after the execute command should only update pencil', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        brushCommand.execute();
        brushCommand.addPoint({ x: 30, y: 40 });
        const spy = spyOn(brushCommand, 'execute');
        brushCommand.addPoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
        const p = brushCommand.getBrush() as SVGPolylineElement;
        expect(p.getAttribute('points')).toEqual('10 12,30 40,30 40');
    });

    it('#addPoint before the execute command should update nothing', () => {
        brushCommand = new BrushCommand(
            rendererServiceSpy.renderer, brush, drawingServiceSpy, texture);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        brushCommand.addPoint({ x: 30, y: 40 });
        expect(spy).not.toHaveBeenCalled();
    });
});
