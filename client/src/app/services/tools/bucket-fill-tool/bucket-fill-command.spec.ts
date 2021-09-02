import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { BucketFillCommand } from './bucket-fill-command';
import { BucketFill } from './bucket-fill.model';

describe('BucketFillCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererService: { renderer: Renderer2 };
    let bucketFillCommand: BucketFillCommand;
    let bucketFill: BucketFill;

    beforeEach(() => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererService = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererService = TestBed.get(RendererProviderService);

        drawingServiceSpy.addObject.and.returnValue(1);

        bucketFill = {
            x: 10,
            y: 12,
            width: 20,
            height: 25,
            href: 'test',
        };
    });

    it('should be created', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        expect(bucketFillCommand).toBeTruthy();
    });

    it('#getFillElement should return the created image', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        bucketFillCommand.execute();
        expect(bucketFillCommand.getFillElement()).toBeTruthy();
    });

    it('#execute should create the good svg image', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        bucketFillCommand.execute();
        const b: SVGImageElement = bucketFillCommand.getFillElement();
        expect(b.getAttribute('name')).toEqual('bucket-fill');
        expect(b.getAttribute('x')).toEqual('10px');
        expect(b.getAttribute('y')).toEqual('12px');
        expect(b.getAttribute('width')).toEqual('20px');
        expect(b.getAttribute('height')).toEqual('25px');
        expect(b.getAttribute('href')).toEqual('test');
    });

    it('#execute should not recreate the good svg image', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        bucketFillCommand.execute();
        const spy = spyOn(rendererService.renderer, 'createElement');
        bucketFillCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#undo should delete the svg image', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        bucketFillCommand.execute();
        bucketFillCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should do nothing', () => {
        bucketFillCommand = new BucketFillCommand(
            rendererService.renderer, bucketFill, drawingServiceSpy);
        bucketFillCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });
});
