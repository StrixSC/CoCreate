import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { PolygonCommand } from './polygon-command';
import { PolygonToolService } from './polygon-tool.service';

describe('PolygonToolService', () => {
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
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        expect(service).toBeTruthy();
    });

    it('should create poly mouse button 0 center', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        (service.parameters.get('polygonStyle') as FormControl).patchValue('center');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: PolygonCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PolygonCommand;
        expect(command).toBeDefined();
        const poly = command.getPolygon();
        expect(poly).toBeDefined();
        expect(poly.getAttribute('x')).toEqual('10px');
        expect(poly.getAttribute('y')).toEqual('12px');
        expect(poly.getAttribute('width')).toEqual('0px');
        expect(poly.getAttribute('height')).toEqual('0px');
        expect(poly.getAttribute('points')).toEqual('10 12');
        expect(poly.style.strokeWidth).toEqual('1px');
        expect(poly.style.fill).toEqual('rgb(100, 200, 50)');
        expect(poly.style.fillOpacity).toEqual('0.6');
        expect(poly.style.stroke).toEqual('none');
        expect(poly.style.strokeOpacity).toEqual('');
    });

    it('should create poly mouse button 0 border', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        (service.parameters.get('polygonStyle') as FormControl).patchValue('border');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: PolygonCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PolygonCommand;
        expect(command).toBeDefined();
        const poly = command.getPolygon();
        expect(poly).toBeDefined();
        expect(poly.getAttribute('x')).toEqual('10px');
        expect(poly.getAttribute('y')).toEqual('12px');
        expect(poly.getAttribute('width')).toEqual('0px');
        expect(poly.getAttribute('height')).toEqual('0px');
        expect(poly.getAttribute('points')).toEqual('10 12');
        expect(poly.style.strokeWidth).toEqual('1px');
        expect(poly.style.fill).toEqual('none');
        expect(poly.style.fillOpacity).toEqual('');
        expect(poly.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(poly.style.strokeOpacity).toEqual('0.3');
    });

    it('should create poly mouse button 0 fill', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: PolygonCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as PolygonCommand;
        expect(command).toBeDefined();
        const poly = command.getPolygon();
        expect(poly).toBeDefined();
        expect(poly.getAttribute('x')).toEqual('10px');
        expect(poly.getAttribute('y')).toEqual('12px');
        expect(poly.getAttribute('width')).toEqual('0px');
        expect(poly.getAttribute('height')).toEqual('0px');
        expect(poly.getAttribute('points')).toEqual('10 12');
        expect(poly.style.strokeWidth).toEqual('1px');
        expect(poly.style.fill).toEqual('rgb(100, 200, 50)');
        expect(poly.style.fillOpacity).toEqual('0.6');
        expect(poly.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(poly.style.strokeOpacity).toEqual('0.3');
    });

    it('should create poly mouse button 2', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: PolygonCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as PolygonCommand;
        expect(command).toBeDefined();
        const poly = command.getPolygon();
        expect(poly).toBeDefined();
        expect(poly.getAttribute('x')).toEqual('10px');
        expect(poly.getAttribute('y')).toEqual('12px');
        expect(poly.getAttribute('width')).toEqual('0px');
        expect(poly.getAttribute('height')).toEqual('0px');
        expect(poly.getAttribute('points')).toEqual('10 12');
        expect(poly.style.strokeWidth).toEqual('1px');
        expect(poly.style.fill).toEqual('rgb(200, 50, 100)');
        expect(poly.style.fillOpacity).toEqual('0.3');
        expect(poly.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(poly.style.strokeOpacity).toEqual('0.6');

    });

    it('should not create poly', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should create poly and resize it +x +y', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create poly and resize it -x -y', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should not create polygon', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        service.onPressed(new MouseEvent('mousedown', { button: 3 }));
        service.onMove(new MouseEvent('mousemove'));
        service.onKeyUp(new KeyboardEvent('keyup', {}));
        service.onKeyDown(new KeyboardEvent('keydown', {}));
        service.dropTool();
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('#onMove should do nothing if called without on press', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should do nothing on dropTool', () => {
        const service: PolygonToolService = TestBed.get(PolygonToolService);
        const result = service.pickupTool();
        expect(result).toBeUndefined();
    });

    it('should do nothing on dropTool', () => {
      const service: PolygonToolService = TestBed.get(PolygonToolService);
      const result = service.dropTool();
      expect(result).toBeUndefined();
  });
});
