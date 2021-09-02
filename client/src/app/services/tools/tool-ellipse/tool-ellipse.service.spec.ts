import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { EllipseCommand } from './ellipse-command';
import { ToolEllipseService } from './tool-ellipse.service';

describe('ToolEllipseService', () => {
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
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        expect(service).toBeTruthy();
    });

    it('should create ellipse mouse button 0 center', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        (service.parameters.get('ellipseStyle') as FormControl).patchValue('center');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: EllipseCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as EllipseCommand;
        expect(command).toBeDefined();
        const ellipse = command.getEllipse();
        expect(ellipse).toBeDefined();
        expect(ellipse.getAttribute('cx')).toEqual('10px');
        expect(ellipse.getAttribute('cy')).toEqual('12px');
        expect(ellipse.getAttribute('width')).toEqual('0px');
        expect(ellipse.getAttribute('height')).toEqual('0px');
        expect(ellipse.style.strokeWidth).toEqual('1px');
        expect(ellipse.style.fill).toEqual('rgb(100, 200, 50)');
        expect(ellipse.style.fillOpacity).toEqual('0.6');
        expect(ellipse.style.stroke).toEqual('none');
        expect(ellipse.style.strokeOpacity).toEqual('');
    });

    it('should create ellipse mouse button 0 border', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        (service.parameters.get('ellipseStyle') as FormControl).patchValue('border');
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: EllipseCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as EllipseCommand;
        expect(command).toBeDefined();
        const ellipse = command.getEllipse();
        expect(ellipse).toBeDefined();
        expect(ellipse.getAttribute('cx')).toEqual('10px');
        expect(ellipse.getAttribute('cy')).toEqual('12px');
        expect(ellipse.getAttribute('width')).toEqual('0px');
        expect(ellipse.getAttribute('height')).toEqual('0px');
        expect(ellipse.style.strokeWidth).toEqual('1px');
        expect(ellipse.style.fill).toEqual('none');
        expect(ellipse.style.fillOpacity).toEqual('');
        expect(ellipse.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(ellipse.style.strokeOpacity).toEqual('0.3');
    });

    it('should create ellipse mouse button 0 fill', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: EllipseCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as EllipseCommand;
        expect(command).toBeDefined();
        const ellipse = command.getEllipse();
        expect(ellipse).toBeDefined();
        expect(ellipse.getAttribute('cx')).toEqual('10px');
        expect(ellipse.getAttribute('cy')).toEqual('12px');
        expect(ellipse.getAttribute('width')).toEqual('0px');
        expect(ellipse.getAttribute('height')).toEqual('0px');
        expect(ellipse.style.strokeWidth).toEqual('1px');
        expect(ellipse.style.fill).toEqual('rgb(100, 200, 50)');
        expect(ellipse.style.fillOpacity).toEqual('0.6');
        expect(ellipse.style.stroke).toEqual('rgb(200, 50, 100)');
        expect(ellipse.style.strokeOpacity).toEqual('0.3');
    });

    it('should create ellipse mouse button 2', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: EllipseCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as EllipseCommand;
        expect(command).toBeDefined();
        const ellipse = command.getEllipse();
        expect(ellipse).toBeDefined();
        expect(ellipse.getAttribute('cx')).toEqual('10px');
        expect(ellipse.getAttribute('cy')).toEqual('12px');
        expect(ellipse.getAttribute('width')).toEqual('0px');
        expect(ellipse.getAttribute('height')).toEqual('0px');
        expect(ellipse.style.strokeWidth).toEqual('1px');
        expect(ellipse.style.fill).toEqual('rgb(200, 50, 100)');
        expect(ellipse.style.fillOpacity).toEqual('0.3');
        expect(ellipse.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(ellipse.style.strokeOpacity).toEqual('0.6');

    });

    it('should not create ellipse', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should create ellipse and resize it +x +y', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create ellipse and resize it -x -y', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create square and resize it +x +y', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create square and resize it -x -y', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { shiftKey: true }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeDefined();

    });

    it('should create ellipse and resize it +x +y after shift release', () => {
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
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
        const service: ToolEllipseService = TestBed.get(ToolEllipseService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();

    });

    it('should do nothing on pickupTool', () => {
      const service: ToolEllipseService = TestBed.get(ToolEllipseService);
      const result = service.pickupTool();
      expect(result).toBeUndefined();
  });

    it('should do nothing on dropTool', () => {
      const service: ToolEllipseService = TestBed.get(ToolEllipseService);
      const result = service.dropTool();
      expect(result).toBeUndefined();
    });
});
