import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { RectangleCommand } from './rectangle-command';
import { ToolRectangleService } from './tool-rectangle.service';

describe('ToolRectangleService', () => {
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
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        expect(service).toBeTruthy();
    });

    it('should create rectangle mouse button 0 center', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        (service.parameters.get('rectStyle') as FormControl).patchValue('center');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: RectangleCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as RectangleCommand;
        expect(command).toBeDefined();
        const rect = command.getRectangle();
        expect(rect).toBeDefined();
        expect(rect.getAttribute('x')).toEqual('10px');
        expect(rect.getAttribute('y')).toEqual('12px');
        expect(rect.getAttribute('width')).toEqual('0px');
        expect(rect.getAttribute('height')).toEqual('0px');
        expect(rect.style.strokeWidth).toEqual('1px');
        expect(rect.style.fill).toEqual('rgb(100, 200, 50)');
        expect(rect.style.fillOpacity).toEqual('0.6');
        expect(rect.style.stroke).toEqual('none');
        expect(rect.style.strokeOpacity).toEqual('');
    });

    it('should create rectangle mouse button 0 border', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        (service.parameters.get('rectStyle') as FormControl).patchValue('border');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: RectangleCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as RectangleCommand;
        expect(command).toBeDefined();
        const rect = command.getRectangle();
        expect(rect).toBeDefined();
        expect(rect.getAttribute('x')).toEqual('10px');
        expect(rect.getAttribute('y')).toEqual('12px');
        expect(rect.getAttribute('width')).toEqual('0px');
        expect(rect.getAttribute('height')).toEqual('0px');
        expect(rect.style.strokeWidth).toEqual('1px');
        expect(rect.style.fill).toEqual('none');
        expect(rect.style.fillOpacity).toEqual('');
        expect(rect.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(rect.style.strokeOpacity).toEqual('0.3');
    });

    it('should create rectangle mouse button 0 fill', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: RectangleCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as RectangleCommand;
        expect(command).toBeDefined();
        const rect = command.getRectangle();
        expect(rect).toBeDefined();
        expect(rect.getAttribute('x')).toEqual('10px');
        expect(rect.getAttribute('y')).toEqual('12px');
        expect(rect.getAttribute('width')).toEqual('0px');
        expect(rect.getAttribute('height')).toEqual('0px');
        expect(rect.style.strokeWidth).toEqual('1px');
        expect(rect.style.fill).toEqual('rgb(100, 200, 50)');
        expect(rect.style.fillOpacity).toEqual('0.6');
        expect(rect.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(rect.style.strokeOpacity).toEqual('0.3');
    });

    it('should create rectangle mouse button 2', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: RectangleCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as RectangleCommand;
        expect(command).toBeDefined();
        const rect = command.getRectangle();
        expect(rect).toBeDefined();
        expect(rect.getAttribute('x')).toEqual('10px');
        expect(rect.getAttribute('y')).toEqual('12px');
        expect(rect.getAttribute('width')).toEqual('0px');
        expect(rect.getAttribute('height')).toEqual('0px');
        expect(rect.style.strokeWidth).toEqual('1px');
        expect(rect.style.fill).toEqual('rgb(200, 50, 100)');
        expect(rect.style.fillOpacity).toEqual('0.3');
        expect(rect.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(rect.style.strokeOpacity).toEqual('0.6');

    });

    it('should not create rectangle', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should create rectangle and resize it +x +y', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create rectangle and resize it -x -y', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create square and resize it +x +y', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create square and resize it -x -y', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create rectangle and resize it +x +y after shift release', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        service.onKeyUp(new KeyboardEvent('keyup', { shiftKey: false }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('#onMove should do nothing if called without on press', () => {
        const service: ToolRectangleService = TestBed.get(ToolRectangleService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should do nothing on pickupTool', () => {
      const service: ToolRectangleService = TestBed.get(ToolRectangleService);
      const result = service.pickupTool();
      expect(result).toBeUndefined();
  });

    it('should do nothing on dropTool', () => {
      const service: ToolRectangleService = TestBed.get(ToolRectangleService);
      const result = service.dropTool();
      expect(result).toBeUndefined();
    });
});
