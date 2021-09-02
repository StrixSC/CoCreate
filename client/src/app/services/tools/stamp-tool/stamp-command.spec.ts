import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { emoji1SvgString } from 'src/assets/stamps/svg';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { DEFAULT_SCALE_COEFFICIENT } from '../tools-constants';
import { StampCommand } from './stamp-command';
import { Stamp } from './stamp.model';

describe('StampCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let stampCommand: StampCommand;
    let stamp: Stamp;

    beforeEach(() => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: DrawingService, useValue: spyDrawingService },
            ],
        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererServiceSpy = TestBed.get(RendererProviderService);

        drawingServiceSpy.addObject.and.returnValue(1);
        stamp = {
            x: 10,
            y: 12,
            sizeFactor: 100,
            svgString: emoji1SvgString,
            angle: 20,
        };
    });

    it('should be created', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        expect(stampCommand).toBeTruthy();
    });

    it('#getStamp should return the created image', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        expect(stampCommand.getStamp()).toBeTruthy();
    });

    it('#execute should create image svg', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        const st = stampCommand.getStamp() as SVGImageElement;
        expect(st.getAttribute('name')).toEqual('stamp');
        // tslint:disable-next-line: max-line-length
        expect(st.getAttribute('transform')).toContain(`scale (${(stamp.sizeFactor / DEFAULT_SCALE_COEFFICIENT).toString()} ${(stamp.sizeFactor / DEFAULT_SCALE_COEFFICIENT).toString()})`);
        expect(st.getAttribute('transform')).toContain(`translate (${stamp.x} ${stamp.y})`);
        expect(st.getAttribute('transform'))
            .toContain(`rotate(${stamp.angle},${stamp.x + stamp.sizeFactor / 2},${stamp.y + stamp.sizeFactor / 2})`);

        expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(st);
    });

    it('#undo should delete image svg', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        stampCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

    it('#undo should do nothing if there is no stamp', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });

    it('#execute should create only once the stamp', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        stampCommand.undo();
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        stampCommand.execute();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#changePosition should move transformation', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        stampCommand.changePosition({ x: 10, y: 10 });
        const img = stampCommand.getStamp() as SVGImageElement;
        expect(img.getAttribute('transform')).toContain(`translate (${10} ${10})`);
    });

    it('#setAngle after the execute command should update transform', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        stampCommand.execute();
        stampCommand.setAngle(400);
        const img = stampCommand.getStamp() as SVGImageElement;
        expect(img.getAttribute('transform')).toContain(`rotate(400,${10 + 100 / 2},${12 + 100 / 2})`);
    });

    it('#setAngle before the execute command should not update transform', () => {
        stampCommand = new StampCommand(
            rendererServiceSpy.renderer, stamp, drawingServiceSpy);
        const spy = spyOn(rendererServiceSpy.renderer, 'setAttribute');
        stampCommand.setAngle(100);
        expect(spy).not.toHaveBeenCalled();
    });
});
