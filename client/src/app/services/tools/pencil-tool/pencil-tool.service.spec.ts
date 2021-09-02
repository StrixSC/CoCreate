import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { PencilCommand } from './pencil-command';
import { PencilToolService } from './pencil-tool.service';

describe('PencilToolService', () => {
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
    });

    it('should be created', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        expect(service).toBeTruthy();
    });

    it('should create dot mouse button 0', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: PencilCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PencilCommand;
        expect(command).toBeDefined();
        const pencil = command.getDot() as SVGCircleElement;
        expect(pencil).toBeDefined();
        expect(pencil.getAttribute('cx')).toEqual('10px');
        expect(pencil.getAttribute('cy')).toEqual('12px');
        expect(pencil.getAttribute('r')).toEqual('4px');
        expect(pencil.style.fill).toEqual('rgb(100, 200, 50)');
        expect(pencil.style.fillOpacity).toEqual('0.6');
    });

    it('should create dot mouse button 2', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: PencilCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as PencilCommand;
        expect(command).toBeDefined();
        const pencil = command.getDot() as SVGCircleElement;
        expect(pencil).toBeDefined();
        expect(pencil.getAttribute('cx')).toEqual('10px');
        expect(pencil.getAttribute('cy')).toEqual('12px');
        expect(pencil.getAttribute('r')).toEqual('4px');
        expect(pencil.style.fill).toEqual('rgb(200, 50, 100)');
        expect(pencil.style.fillOpacity).toEqual('0.3');
    });

    it('should not create pencil or dot', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        service.onPressed(new MouseEvent('mousedown', { button: 3 }));
        service.onMove(new MouseEvent('mousemove'));
        service.onKeyUp(new KeyboardEvent('keyup', {}));
        service.onKeyDown(new KeyboardEvent('keydown', {}));
        service.pickupTool();
        service.dropTool();
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('should not create pencil or dot if stroke width is invalid', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        (service.parameters.get('strokeWidth') as FormControl).setErrors({ incorrect: true });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onMove(new MouseEvent('mousemove'));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('should create pencil', () => {
        const service: PencilToolService = TestBed.get(PencilToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command: PencilCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PencilCommand;
        expect(command).toBeDefined();
        const pencil = command.getPencil() as SVGPolylineElement;
        expect(pencil).toBeDefined();
        expect(pencil.getAttribute('name')).toEqual('pencil');
        expect(pencil.getAttribute('points')).toEqual('10 12,12 22');
        expect(pencil.style.strokeWidth).toEqual('8px');
        expect(pencil.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(pencil.style.strokeOpacity).toEqual('0.6');
    });
});
