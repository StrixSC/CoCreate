import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { RGBA } from 'src/app/model/rgba.model';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { TexturesService } from '../../textures/textures.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { BrushCommand } from './brush-command';
import { BrushToolService } from './brush-tool.service';

describe('BrushToolService', () => {
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let textureSpy: jasmine.SpyObj<TexturesService>;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
        };
        let spyTexture = jasmine.createSpyObj('TexturesService', ['getTextureElement']);
        spyTexture = {
            ...spyTexture,
            firstTexture: { value: 1 },
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
                { provide: TexturesService, useValue: spyTexture },
            ],
        });

        drawingServiceSpy = TestBed.get(DrawingService);
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy.addObject.and.returnValue(1);
        textureSpy = TestBed.get(TexturesService);

        textureSpy.getTextureElement.and.callFake((num: number, primCol: RGBA, x: number, y: number, r: Renderer2) => {
            const defs = r.createElement('defs', 'svg');
            const pat = r.createElement('pattern', 'svg');
            r.setProperty(pat, 'id', 'pat-id');
            r.appendChild(defs, pat);
            return defs;
        });
    });

    it('should be created', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        expect(service).toBeTruthy();
    });

    it('should create dot mouse button 0', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        const command: BrushCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as BrushCommand;
        expect(command).toBeDefined();
        const brush = command.getDot() as SVGCircleElement;
        expect(brush).toBeDefined();
        expect(brush.getAttribute('cx')).toEqual('10px');
        expect(brush.getAttribute('cy')).toEqual('12px');
        expect(brush.getAttribute('r')).toEqual('4px');
        expect(brush.getAttribute('fill')).toEqual('url(#pat-id)');
        expect(brush.style.fillOpacity).toEqual('');
    });

    it('should create dot mouse button 2', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command: BrushCommand = service.onRelease(new MouseEvent('mouseup', { button: 2 })) as BrushCommand;
        expect(command).toBeDefined();
        const brush = command.getDot() as SVGCircleElement;
        expect(brush).toBeDefined();
        expect(brush.getAttribute('cx')).toEqual('10px');
        expect(brush.getAttribute('cy')).toEqual('12px');
        expect(brush.getAttribute('r')).toEqual('4px');
        expect(brush.getAttribute('fill')).toEqual('url(#pat-id)');
        expect(brush.style.fillOpacity).toEqual('');
    });

    it('should not create brush or dot', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        service.onPressed(new MouseEvent('mousedown', { button: 3 }));
        service.onMove(new MouseEvent('mousemove'));
        service.onKeyUp(new KeyboardEvent('keyup', {}));
        service.onKeyDown(new KeyboardEvent('keydown', {}));
        service.pickupTool();
        service.dropTool();
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        textureSpy.getTextureElement.and.returnValue(null);
        service.onPressed(new MouseEvent('mousedown', { button: 2 }));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('should not create pencil or dot if stroke width is invalid', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        (service.parameters.get('strokeWidth') as FormControl).setErrors({ incorrect: true });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        service.onMove(new MouseEvent('mousemove'));
        const command = service.onRelease(new MouseEvent('mouseup', { button: 0 }));
        expect(command).toBeUndefined();
    });

    it('should create brush', () => {
        const service: BrushToolService = TestBed.get(BrushToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service.onPressed(new MouseEvent('mousedown', { button: 0 }));
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 12, y: 22 });
        service.onMove(new MouseEvent('mousemove', { button: 0 }));
        const command: BrushCommand = service.onRelease(new MouseEvent('mouseup', { button: 0 })) as BrushCommand;
        expect(command).toBeDefined();
        const brush = command.getBrush() as SVGPolylineElement;
        expect(brush).toBeDefined();
        expect(brush.getAttribute('name')).toEqual('brush');
        expect(brush.getAttribute('points')).toEqual('10 12,12 22');
        expect(brush.style.strokeWidth).toEqual('8px');
        expect(brush.getAttribute('stroke')).toEqual('url(#pat-id)');
        expect(brush.style.strokeOpacity).toEqual('');
    });
});
