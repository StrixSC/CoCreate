  import { Renderer2 } from '@angular/core';
  import { TestBed } from '@angular/core/testing';
  import { DrawingService } from '../../drawing/drawing.service';
  import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
  import { TextCommand } from './text-command';
  import { Text } from './text.model';

  describe('TextCommand', () => {
      let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
      let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
      let textCommand: TextCommand;
      let text: Text;

      beforeEach(() => {
          const rendererSpy = jasmine.createSpyObj('Renderer2',
           ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
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
          text = {
            text: 'hello \n\nlong world!',
            x: 10,
            y: 12,
            fontSize: 12,
            textAnchor: 'start',
            fontFamily: 'Arial',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: 'rgb(100, 200, 150)',
            fillOpacity: 0.8,
        };
    });

      it('should be created', () => {
          textCommand = new TextCommand(
              rendererServiceSpy.renderer, text, drawingServiceSpy);
          expect(textCommand).toBeTruthy();
      });

      it('#execute should create text svg', () => {
          textCommand = new TextCommand(
              rendererServiceSpy.renderer, text, drawingServiceSpy);
          textCommand.execute();
          const textSVG = textCommand.getText();
          expect(textSVG.getAttribute('x')).toEqual(text.x.toString() + 'px');
          expect(textSVG.getAttribute('y')).toEqual(text.y.toString() + 'px');
          expect(textSVG.style.fontSize).toEqual(text.fontSize.toString() + 'px');
          expect(textSVG.style.textAnchor).toEqual(text.textAnchor);
          expect(textSVG.style.fontFamily).toEqual(text.fontFamily);
          expect(textSVG.style.fontWeight).toEqual(text.fontWeight);
          expect(textSVG.style.fill).toEqual(text.fill);
          expect(textSVG.style.fillOpacity).toEqual(text.fillOpacity.toString());
          expect(textSVG.children[0].innerHTML).toEqual('hello ');
          expect(textSVG.children[1].innerHTML).toEqual('long world!');
          expect(drawingServiceSpy.addObject).toHaveBeenCalledWith(textSVG);
      });

      it('#undo should delete text svg', () => {
        textCommand = new TextCommand(
            rendererServiceSpy.renderer, text, drawingServiceSpy);
        textCommand.execute();
        textCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalledWith(0);
    });

      it('#undo should do nothing', () => {
          textCommand = new TextCommand(
              rendererServiceSpy.renderer, text, drawingServiceSpy);
          textCommand.undo();
          expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();
      });

      it('#execute after undo should not recreate text but only add it', () => {
          textCommand = new TextCommand(
              rendererServiceSpy.renderer, text, drawingServiceSpy);
          textCommand.execute();
          textCommand.undo();
          const spy = spyOn(rendererServiceSpy.renderer, 'createElement');
          textCommand.execute();
          expect(spy).not.toHaveBeenCalled();
      });
  });
