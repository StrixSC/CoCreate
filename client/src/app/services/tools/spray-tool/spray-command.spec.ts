import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Spray } from '../spray-tool/spray.model';
import { SprayCommand } from './spray-command';

describe('SprayCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let sprayCommand: SprayCommand;
    let spray: Spray ;

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
        spray = {
            pointsList: [{ x: 10, y: 12 }],
            radius: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',
        };
    });

    it('should be created', () => {
        sprayCommand = new SprayCommand(
            rendererServiceSpy.renderer, spray, drawingServiceSpy);
        expect(SprayCommand).toBeTruthy();
    });

    it('#execute shoud create spray', () => {
      sprayCommand = new SprayCommand(
          rendererServiceSpy.renderer, spray, drawingServiceSpy);
      sprayCommand.execute();
      expect(sprayCommand.getSpray()).toBeTruthy();
    });

    it('#undo should remove the spray', () => {
      sprayCommand = new SprayCommand(
          rendererServiceSpy.renderer, spray, drawingServiceSpy);
      sprayCommand.execute();
      sprayCommand.undo();
      expect(drawingServiceSpy.removeObject).toHaveBeenCalled();
    });

    it('#undo should do nothing because spray do not exist', () => {
      sprayCommand = new SprayCommand(
          rendererServiceSpy.renderer, spray, drawingServiceSpy);
      sprayCommand.undo();
      expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
    });

    it('should update points', () => {
      sprayCommand = new SprayCommand(
        rendererServiceSpy.renderer, spray, drawingServiceSpy);
      sprayCommand.execute();
      sprayCommand.updatePoint();
      const sprayElement = sprayCommand.getSpray() as SVGGElement;
      expect(sprayElement.childElementCount).toEqual(1);
      expect(sprayElement.children[0].getAttribute('cx')).toEqual('10');
      expect(sprayElement.children[0].getAttribute('cy')).toEqual('12');
      expect(sprayElement.children[0].getAttribute('r')).toEqual('10');
    });

    it('should not create again spray because it already exist', () => {
      sprayCommand = new SprayCommand(
          rendererServiceSpy.renderer, spray, drawingServiceSpy);
      const spy = spyOn(rendererServiceSpy.renderer, 'createElement').and.callThrough();
      sprayCommand.execute();
      sprayCommand.execute();
      expect(spy).toHaveBeenCalledTimes(1);
    });

  });
