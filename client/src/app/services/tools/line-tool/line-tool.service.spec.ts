import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { INITIAL_WIDTH } from '../tools-constants';
import { LineCommand } from './line-command';
import { LineToolService } from './line-tool.service';

describe('LineToolService', () => {
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: OffsetManagerService, useValue: spyOffset },
                {
                    provide: ToolsColorService, useValue: {
                        primaryColorString: 'rgb(100,200,50)', primaryAlpha: 0.6,
                        secondaryColorString: 'rgb(200,50,100)', secondaryAlpha: 0.3,
                    },
                },
            ],
        });

        drawingServiceSpy = TestBed.get(DrawingService);
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy.addObject.and.returnValue(1);
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        expect(service).toBeTruthy();
    });

    it('should create line mouse button 0 with round style jonction and no dashArray', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22');
        expect(line.getAttribute('name')).toEqual('line');
        expect(line.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(line.style.strokeOpacity).toEqual('0.6');
        expect(line.style.fill).toEqual('none');
        expect(line.style.strokeWidth).toEqual(INITIAL_WIDTH.toString() + 'px');
        expect(line.style.strokeLinecap).toEqual('round');
        expect(line.style.strokeLinejoin).toEqual('round');
    });

    it('should create line mouse button 0 with mitter style jonction and small dashArray', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        service.parameters.patchValue({ rectStyleMotif: 'smallDasharray' });
        service.parameters.patchValue({ rectStyleJonction: 'angle' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22');
        expect(line.getAttribute('name')).toEqual('line');
        expect(line.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(line.style.strokeOpacity).toEqual('0.6');
        expect(line.style.fill).toEqual('none');
        expect(line.style.strokeWidth).toEqual(INITIAL_WIDTH.toString() + 'px');
        expect(line.style.strokeLinecap).toEqual('square');
        expect(line.style.strokeLinejoin).toEqual('miter');
        expect(line.style.strokeDasharray).toEqual(`${1}px, ${INITIAL_WIDTH * 1.5}px`);
    });

    it('should create line mouse button 0 with marker style jonction and largedashArray', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        service.parameters.patchValue({ rectStyleMotif: 'largeDasharray' });
        service.parameters.patchValue({ rectStyleJonction: 'marker' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22');
        expect(line.getAttribute('name')).toEqual('line');
        expect(line.getAttribute('marker-start')).toEqual('url(#24-Marker-0)');
        expect(line.getAttribute('marker-mid')).toEqual('url(#24-Marker-0)');
        expect(line.getAttribute('marker-end')).toEqual('url(#24-Marker-0)');
        expect(line.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(line.style.strokeOpacity).toEqual('0.6');
        expect(line.style.fill).toEqual('none');
        expect(line.style.strokeWidth).toEqual(INITIAL_WIDTH.toString() + 'px');
        expect(line.style.strokeDasharray).toEqual(`${INITIAL_WIDTH * 2}px`);
        const marker = command.getMarkerDefs() as SVGDefsElement;
        expect(marker).toBeDefined();
        expect((marker.firstChild as HTMLElement).id).toEqual('24-Marker-0');
    });

    it('should create line mouse button 2 with round style jonction and no dashArray', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22');
        expect(line.getAttribute('name')).toEqual('line');
        expect(line.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(line.style.strokeOpacity).toEqual('0.3');
        expect(line.style.fill).toEqual('none');
        expect(line.style.strokeWidth).toEqual(INITIAL_WIDTH.toString() + 'px');
        expect(line.style.strokeLinecap).toEqual('round');
        expect(line.style.strokeLinejoin).toEqual('round');
    });

    it('should create when change tool', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.dropTool();
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
    });

    it('should do nothing', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onKeyUp(new KeyboardEvent('keyup'));
        service.onKeyDown(new KeyboardEvent('keydown'));
        expect(service.onRelease(new MouseEvent('mouseup', { button: 0 }))).toBeUndefined();
    });

    it('should create line and have last point at first point', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as LineCommand;
        service.onKeyUp(new KeyboardEvent('keyup', { shiftKey: true }));
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22,10 12');
    });

    it('should backspace', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 30, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        service.onKeyDown(new KeyboardEvent('keydown', { code: 'Backspace' }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as LineCommand;
        expect(command).toBeDefined();
        const line = command.getLine() as SVGPolylineElement;
        expect(line).toBeDefined();
        expect(line.getAttribute('points')).toEqual('10 12,20 12,20 22');
    });

    it('should esc', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(30);
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onKeyDown(new KeyboardEvent('keydown', { code: 'Escape' }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as LineCommand;
        expect(command).toBeUndefined();
    });

    it('should backspace delete', () => {
        const service: LineToolService = TestBed.get(LineToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 12 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        service.onRelease(new MouseEvent('mouseup', { button: 2 }));
        jasmine.clock().tick(300);
        service.onKeyDown(new KeyboardEvent('keydown', { code: 'Backspace' }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 20, y: 22 });
        service.onMove(new MouseEvent('mousemove'));
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: LineCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as LineCommand;
        expect(command).toBeUndefined();
    });
});
