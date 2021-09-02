import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { CopyPasteOffsetService } from './copy-paste-offset.service';
import { PasteDuplicateCommand } from './paste-duplicate-command';

describe('pasteDuplicateCommand', () => {
    let copyPasteOffsetServiceSpy: jasmine.SpyObj<CopyPasteOffsetService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let duplicateCommand: PasteDuplicateCommand;
    let pasteCommand: PasteDuplicateCommand;

    beforeEach(() => {
        let offsetSpy = jasmine.createSpyObj('CopyPasteOffsetService', ['']);
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };
        offsetSpy = {
            ...offsetSpy,
            OFFSET_CONST: 5,
        };
        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: CopyPasteOffsetService, useValue: offsetSpy },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererServiceSpy = TestBed.get(RendererProviderService);
        copyPasteOffsetServiceSpy = TestBed.get(CopyPasteOffsetService);

        drawingServiceSpy.addObject.and.returnValue(1);
    });

    it('should be created', () => {
        pasteCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [], false,
        );
        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [], true,
        );
        expect(pasteCommand).toBeTruthy();
        expect(duplicateCommand).toBeTruthy();
    });

    it('#execute should add new object to the svg and set the offset to the last offset', () => {
        const svgEl1 = document.createElement('rect') as Element as SVGElement;
        const svgEl2 = document.createElement('rect') as Element as SVGElement;
        svgEl2.id = '2';
        const svgEl3 = document.createElement('rect') as Element as SVGElement;
        svgEl3.setAttribute('transform', 'translate(5,5)');
        const spySetAttrib = spyOn(svgEl1, 'setAttribute');
        drawingServiceSpy.addObject.and.returnValue(1);
        copyPasteOffsetServiceSpy.duplicateOffset = { x: 5, y: 5 };
        copyPasteOffsetServiceSpy.offsetInit = { x: 5, y: 5 };

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl1, svgEl2, svgEl3], false,
        );

        copyPasteOffsetServiceSpy.duplicateOffset = { x: 10, y: 10 };

        duplicateCommand.execute();

        expect(copyPasteOffsetServiceSpy.duplicateOffset).toEqual({ x: 5, y: 5 });
        expect(spySetAttrib).toHaveBeenCalled();
        expect(drawingServiceSpy.addObject).toHaveBeenCalled();
    });

    it('#execute should set duplicateOffset to x = 0 and y = 0 when offset x is higher than drawing width', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;

        copyPasteOffsetServiceSpy.duplicateOffset = { x: 5, y: 5 };
        copyPasteOffsetServiceSpy.offsetInit = { x: 5, y: 5 };
        drawingServiceSpy.width = 4;
        drawingServiceSpy.height = 6;

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl], false,
        );

        duplicateCommand.execute();

        expect(copyPasteOffsetServiceSpy.duplicateOffset).toEqual({ x: 0, y: 0 });
    });

    it('#undo for paste should delete the object copied', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.setAttribute('fill', 'url(#allo)');
        const svgDef = document.createElement('def') as Element as SVGElement;
        svgDef.id = 'allo';

        spyOn(document, 'getElementById').and.returnValue(svgDef as Element as HTMLElement);
        drawingServiceSpy.addObject.and.returnValue(1);
        copyPasteOffsetServiceSpy.pasteOffset = { x: 10, y: 10 };

        pasteCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl], true,
        );

        pasteCommand.execute();
        pasteCommand.undo();

        expect(copyPasteOffsetServiceSpy.pasteOffset)
            .toEqual({ x: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST, y: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST });
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(2);
    });

    it('#undo for duplicate should delete the object copied', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.setAttribute('fill', 'url(#allo)');
        const svgDef = document.createElement('def') as Element as SVGElement;
        svgDef.id = 'allo';

        spyOn(document, 'getElementById').and.returnValue(svgDef as Element as HTMLElement);
        drawingServiceSpy.addObject.and.returnValue(1);
        copyPasteOffsetServiceSpy.duplicateOffset = { x: 10, y: 10 };
        copyPasteOffsetServiceSpy.offsetInit = { x: 10, y: 10 };

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl], false,
        );

        duplicateCommand.execute();
        duplicateCommand.undo();

        expect(copyPasteOffsetServiceSpy.duplicateOffset)
            .toEqual({ x: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST, y: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST });
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(2);
    });

    it('#undo should delete nothing since theres no object to add with #paste', () => {
        copyPasteOffsetServiceSpy.duplicateOffset = { x: 10, y: 10 };
        copyPasteOffsetServiceSpy.offsetInit = { x: 10, y: 10 };

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [], false,
        );

        duplicateCommand.execute();
        duplicateCommand.undo();

        expect(copyPasteOffsetServiceSpy.duplicateOffset)
            .toEqual({ x: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST, y: 10 - copyPasteOffsetServiceSpy.OFFSET_CONST });
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledTimes(0);
    });

    it('#paste should add a def from list object to the svg ', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;
        svgEl.setAttribute('fill', 'url(#allo)');
        const svgDef = document.createElement('def') as Element as SVGElement;
        svgDef.id = 'allo';

        spyOn(document, 'getElementById').and.returnValue(svgDef as Element as HTMLElement);
        drawingServiceSpy.addObject.and.returnValue(1);
        copyPasteOffsetServiceSpy.duplicateOffset = { x: 10, y: 10 };
        copyPasteOffsetServiceSpy.offsetInit = { x: 10, y: 10 };

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl], false,
        );

        duplicateCommand.execute();
        duplicateCommand.undo();
        duplicateCommand.execute();

        expect(copyPasteOffsetServiceSpy.duplicateOffset)
            .toEqual({ x: 10, y: 10 });
        expect(drawingServiceSpy.addObject).toHaveBeenCalled();
    });

    it('#getObjectList should get the object list of the command', () => {
        const svgEl = document.createElement('rect') as Element as SVGElement;

        duplicateCommand = new PasteDuplicateCommand(
            rendererServiceSpy.renderer, drawingServiceSpy,
            copyPasteOffsetServiceSpy, [svgEl], false,
        );

        expect(duplicateCommand.getObjectList()).toEqual([svgEl]);
    });
});
