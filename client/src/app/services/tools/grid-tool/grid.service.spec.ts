import { EventEmitter, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { GridService } from './grid.service';

describe('GridService', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject', 'width', 'height']);
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawingEmit: new EventEmitter(),
        };
        rendererServiceSpy = {
            renderer: rendererSpy,
        };
        spyDrawingService.drawing = document.createElementNS('svg', 'svg') as SVGElement;
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: RendererProviderService, useValue: rendererServiceSpy },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        drawingServiceSpy.addObject.and.returnValue(1);
        drawingServiceSpy.width = 0;
        drawingServiceSpy.height = 0;

    });

    it('should be created', () => {
        const service: GridService = TestBed.get(GridService);
        expect(service).toBeTruthy();
    });

    it('should change color of grid if the function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        service.createPatternGrid();
        const color: string = (service.parameters.get('color') as FormControl).value;
        service.changeColor();
        expect(drawingServiceSpy.renderer.setStyle).toHaveBeenCalledWith('rect', 'stroke', color);
    });
    it('should change opacity of grid if the function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        service.createPatternGrid();
        const transparence: number = (service.parameters.get('transparence') as FormControl).value;
        service.changeOpacity();
        expect(drawingServiceSpy.renderer.setStyle).toHaveBeenCalledWith('rect', 'stroke-opacity', transparence.toString());
    });

    it('should hide grid if the function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        service.createPatternGrid();
        service.activateGrid.setValue(false);
        expect(drawingServiceSpy.renderer.setStyle).toHaveBeenCalledWith('rect', 'visibility', 'hidden');
    });

    it('should show grid if the function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        service.createPatternGrid();

        service.activateGrid.setValue(true);
        expect(drawingServiceSpy.renderer.setStyle).toHaveBeenCalledWith('rect', 'visibility', 'visible');
    });

    it('should change size of grid if the function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        service.createPatternGrid();
        const sizeCell: number = (service.parameters.get('sizeCell') as FormControl).value;
        service.changeGridSize();
        expect(drawingServiceSpy.renderer.setAttribute).toHaveBeenCalledWith('pattern', 'width', `${sizeCell}px`);
        expect(drawingServiceSpy.renderer.setAttribute).toHaveBeenCalledWith('pattern', 'height', `${sizeCell}px`);
        expect(drawingServiceSpy.renderer.setAttribute).toHaveBeenCalledWith('rect', 'width', `${sizeCell}px`);
        expect(drawingServiceSpy.renderer.setAttribute).toHaveBeenCalledWith('rect', 'height', `${sizeCell}px`);
    });

    it('should create pattern grid when function is called', () => {
        const service: GridService = TestBed.get(GridService);
        rendererSpy.createElement.withArgs('defs', 'svg').and.returnValue('defs');
        rendererSpy.createElement.withArgs('pattern', 'svg').and.returnValue('pattern');
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue('rect');
        const sizeCell: number = (service.parameters.get('sizeCell') as FormControl).value;
        const spy = spyOn(service as any, 'setStyle');
        const x = 0;
        const y = 0;
        service.createPatternGrid();
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('pattern', 'x', `${x}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('pattern', 'y', `${y}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('pattern', 'width', `${sizeCell}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('pattern', 'height', `${sizeCell}px`);

        expect(rendererSpy.createElement).toHaveBeenCalledWith('rect', 'svg');
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('rect', 'x', `${x}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('rect', 'y', `${y}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('rect', 'width', `${sizeCell}px`);
        expect(rendererSpy.setAttribute).toHaveBeenCalledWith('rect', 'height', `${sizeCell}px`);

        expect(spy).toHaveBeenCalled();
        expect(drawingServiceSpy.renderer.appendChild).toHaveBeenCalledWith('defs', 'pattern');
        expect(drawingServiceSpy.renderer.appendChild).toHaveBeenCalledWith('pattern', 'rect');

        expect(rendererSpy.appendChild).toHaveBeenCalledTimes(4);
    });

    it('should react on drawingEmit', () => {
        TestBed.get(GridService);

        rendererSpy.setAttribute.calls.reset();
        rendererSpy.appendChild.calls.reset();

        drawingServiceSpy.drawingEmit.emit();

        expect(rendererSpy.setAttribute).toHaveBeenCalledTimes(2);
        expect(rendererSpy.appendChild).toHaveBeenCalledTimes(2);
    });

    it('should activateGrid when toggleGrid is called', () => {
        const service: GridService = TestBed.get(GridService);
        service.activateGrid.patchValue(true);
        service.toggleGrid();
        expect(service.activateGrid.value).toEqual(false);
    });
});
