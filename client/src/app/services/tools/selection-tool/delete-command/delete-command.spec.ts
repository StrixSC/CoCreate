import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../../drawing/drawing.service';
import { RendererProviderService } from '../../../renderer-provider/renderer-provider.service';
import { DeleteCommand } from './delete-command';

describe('RectangleCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let deleteCommand: DeleteCommand;

    beforeEach(() => {
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);

        drawingServiceSpy.addObject.and.returnValue(1);
    });

    it('should be created', () => {
        deleteCommand = new DeleteCommand(drawingServiceSpy, []);
        expect(deleteCommand).toBeTruthy();
    });

    it('#execute should remove only one object', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.id = '5';
        deleteCommand = new DeleteCommand(drawingServiceSpy, [svgEl]);

        deleteCommand.execute();

        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(1);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(5);
    });

    it('#execute should remove two object', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.id = '5';
        svgEl.setAttribute('fill', 'url(#allo)');
        const svgDef = document.createElement('def') as Element as SVGElement;
        svgDef.id = '30';
        const svgmarker = document.createElement('marker') as Element as SVGElement;
        svgmarker.id = 'allo';

        svgDef.appendChild(svgmarker);

        spyOn(document, 'getElementById').and.returnValue(svgmarker as Element as HTMLElement);

        deleteCommand = new DeleteCommand(drawingServiceSpy, [svgEl]);

        deleteCommand.execute();

        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(5);
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(30);
    });

    it('#undo should add only one object', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.id = '5';

        deleteCommand = new DeleteCommand(drawingServiceSpy, [svgEl]);

        deleteCommand.execute();
        deleteCommand.undo();

        expect(drawingServiceSpy.addObject).toHaveBeenCalledTimes(1);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(svgEl);
    });

    it('#undo should add two object', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.id = '5';
        svgEl.setAttribute('fill', 'url(#allo)');
        const svgDef = document.createElement('def') as Element as SVGElement;
        svgDef.id = '30';
        const svgmarker = document.createElement('marker') as Element as SVGElement;
        svgmarker.id = 'allo';

        svgDef.appendChild(svgmarker);

        spyOn(document, 'getElementById').and.returnValue(svgmarker as Element as HTMLElement);

        deleteCommand = new DeleteCommand(drawingServiceSpy, [svgEl]);

        deleteCommand.execute();
        deleteCommand.undo();

        expect(drawingServiceSpy.addObject).toHaveBeenCalledTimes(2);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(svgEl);
        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(svgDef);
    });
});
