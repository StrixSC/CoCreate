import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { DEFAULT_SCALE_COEFFICIENT, INITIAL_SCALE } from '../tools-constants';
import { StampCommand } from './stamp-command';
import { StampToolService } from './stamp-tool.service';

describe('StampToolService', () => {
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
            ],
        });

        drawingServiceSpy = TestBed.get(DrawingService);
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy.addObject.and.returnValue(1);
    });

    it('should be created', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        expect(service).toBeTruthy();
    });

    it('should create stamp mouse button 0', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        const offset = { x: 10, y: 12 };
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeDefined();
        const stampElement = command.getStamp() as SVGImageElement;
        expect(stampElement).toBeDefined();
        expect(stampElement.getAttribute('name')).toEqual('stamp');
        expect(stampElement.getAttribute('transform')).toContain(`rotate(0,10,12)`);
        // tslint:disable-next-line: max-line-length
        expect(stampElement.getAttribute('transform')).toContain(`scale (${(INITIAL_SCALE / DEFAULT_SCALE_COEFFICIENT).toString()} ${(INITIAL_SCALE / DEFAULT_SCALE_COEFFICIENT).toString()})`);
        // tslint:disable-next-line: max-line-length
        expect(stampElement.getAttribute('transform')).toContain(`translate (${(offset.x - INITIAL_SCALE / 2).toString()} ${(offset.y - INITIAL_SCALE / 2).toString()})`);

    });

    it('should create stamp mouse button 0 and remove it if not released before tool change', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        const offset = { x: 10, y: 12 };
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.dropTool();
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).not.toBeDefined();
    });

    it('should be able to move stamp', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        let offset = { x: 10, y: 12 };
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offset = { x: 20, y: 15 };
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue(offset);
        service.onMove(new MouseEvent('mousedown', { button: 0 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command.getStamp()).toBeDefined();

    });

    it('should not create stamp mouse button 2', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as StampCommand;
        expect(command).toBeUndefined();
    });

    it('#onMove should do nothing if called without on press', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 6 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        service.dropTool();
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('should create stamp and rotate it', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -15 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeDefined();
        const stamp = command.getStamp() as SVGImageElement;
        expect(stamp).toBeDefined();
        expect(stamp.getAttribute('transform')).toContain(`rotate(345,10,12)`);
    });

    it('should create stamp and rotate it with small interval', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { altKey: true }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        service.onKeyUp(new KeyboardEvent('keydown', { altKey: true }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeDefined();
        const stamp = command.getStamp() as SVGImageElement;
        expect(stamp).toBeDefined();
        expect(stamp.getAttribute('transform')).toContain(`rotate(31,10,12)`);
    });

    it('should create stamp and rotate it without having his interval changed', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onKeyDown(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        service.onKeyUp(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeDefined();
        const stamp = command.getStamp() as SVGImageElement;
        expect(stamp).toBeDefined();
        expect(stamp.getAttribute('transform')).toContain(`rotate(45,10,12)`);
    });

    it('should not create stamp and do nothing with mouse wheel', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onKeyDown(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        service.onKeyUp(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeUndefined();
    });

    it('should not set angleForward in command since command does not exist', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.registerEventListenerOnScroll();
        service.onKeyDown(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeUndefined();
    });

    it('should not set angleBackward in command since command does not exist', () => {
        const service: StampToolService = TestBed.get(StampToolService);
        service.parameters.patchValue({ stampSvgString: 'ref' });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.registerEventListenerOnScroll();
        service.onKeyDown(new KeyboardEvent('keydown', { altKey: false }));
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -15 }));
        const command: StampCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as StampCommand;
        expect(command).toBeUndefined();
    });
});
