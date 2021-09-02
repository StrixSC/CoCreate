import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { PipetteToolService } from './pipette-tool.service';

describe('PipetteToolService', () => {
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let colorToolServiceSpy: jasmine.SpyObj<ToolsColorService>;
    let service: PipetteToolService;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        const spyToolColorService = jasmine.createSpyObj('ToolColorService', ['setPrimaryColor', 'setSecondaryColor']);

        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            width: 100,
            height: 100,
        };

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: OffsetManagerService, useValue: spyOffset },
                { provide: ToolsColorService, useValue: spyToolColorService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        const rendererProvider: RendererProviderService = TestBed.get(RendererProviderService);
        drawingServiceSpy.drawing = rendererProvider.renderer.createElement('svg', 'svg');
        rendererProvider.renderer.setStyle(drawingServiceSpy.drawing, 'backgroundColor', 'rgba(200,140,50,0.5)');
        const rect: SVGRectElement = rendererProvider.renderer.createElement('rect', 'svg');
        rendererProvider.renderer.setAttribute(drawingServiceSpy.drawing, 'width', '5');
        rendererProvider.renderer.setAttribute(drawingServiceSpy.drawing, 'height', '5');
        rendererProvider.renderer.setAttribute(rect, 'width', '5');
        rendererProvider.renderer.setAttribute(rect, 'height', '5');
        rendererProvider.renderer.setStyle(rect, 'fill', 'rgb(30,40,50)');
        rendererProvider.renderer.setAttribute(rect, 'x', '3');
        rendererProvider.renderer.setAttribute(rect, 'y', '3');
        rendererProvider.renderer.appendChild(drawingServiceSpy.drawing, rect);
        drawingServiceSpy.width = 5;
        drawingServiceSpy.height = 5;
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy.addObject.and.returnValue(1);
        colorToolServiceSpy = TestBed.get(ToolsColorService);
        service = TestBed.get(PipetteToolService);

    });

    it('pipette service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do nothing if the click is not left or right', async () => {

        const event = new MouseEvent('mousedown', { button: 1 });
        await service.onPressed(event);
        expect(colorToolServiceSpy.setPrimaryColor).not.toHaveBeenCalled();
        expect(colorToolServiceSpy.setSecondaryColor).not.toHaveBeenCalled();
    });

    it('should set the primary color', async () => {
        const event = new MouseEvent('onpress', { button: 0 });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 1, y: 1 });
        await service.onPressed(event);
        expect(colorToolServiceSpy.setPrimaryColor).toHaveBeenCalledWith({ r: 199, g: 139, b: 50 }, 0.5);
    });

    it('should not set the primary color if outside of drawing', async () => {
        const event = new MouseEvent('onpress', { button: 0 });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: -1, y: -1 });
        await service.onPressed(event);
        expect(colorToolServiceSpy.setPrimaryColor).not.toHaveBeenCalled();
        expect(colorToolServiceSpy.setSecondaryColor).not.toHaveBeenCalled();
    });

    it('should set the secondary color', async () => {
        const event = new MouseEvent('onpress', { button: 2 });
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 4, y: 4 });
        await service.onPressed(event);
        expect(colorToolServiceSpy.setSecondaryColor).toHaveBeenCalledWith({ r: 30, g: 40, b: 50 }, 1);
    });

    it('should do nothing', () => {
        service.onRelease(new MouseEvent('onrelease'));
        service.onMove(new MouseEvent('onmove'));
        service.onKeyUp(new KeyboardEvent('onkeyup'));
        service.onKeyDown(new KeyboardEvent('onkeydown'));
        service.pickupTool();
        service.dropTool();
        expect().nothing();
    });
});
