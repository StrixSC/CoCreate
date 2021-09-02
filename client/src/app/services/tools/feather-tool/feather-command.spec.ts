
import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { FeatherCommand } from './feather-command';
import { Feather } from './feather-model';
describe('FeatherCommand', () => {
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererServiceSpy: { renderer: jasmine.SpyObj<Renderer2> };
    let featherCommand: FeatherCommand;
    let feather: Feather;

    beforeEach(() => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
        const spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject']);
        rendererServiceSpy = {
            renderer: rendererSpy,
        };
        TestBed.configureTestingModule({
            providers: [RendererProviderService, {provide: DrawingService, useValue: spyDrawingService}],

        });
        drawingServiceSpy = TestBed.get(DrawingService);
        rendererServiceSpy = TestBed.get(RendererProviderService);
        feather = {
            rotationAngle: 0,
            pointsList: [{ x: 10, y: 12 }],
            strokeWidth: 10,
            fill: 'rgb(100, 20, 30)',
            stroke: 'rgb(150, 200, 130)',
            fillOpacity: '1',
            strokeOpacity: '0.5',

        };
    });
    it('should be created', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);
        expect(featherCommand).toBeTruthy();
    });
    it('#execute should create a feather svggelement', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);

        featherCommand.execute();
            // disabled pour tester l'etat des attributs prives
    /*  tslint:disable:disable-next-line: no-string-literal */
        const featherElement = featherCommand['feather'] as SVGGElement;
        expect(featherElement).toBeDefined();
        expect(featherElement.getAttribute('name')).toEqual('feather');
        expect(featherElement.style.fill).toEqual(feather.fill);
        expect(featherElement.style.stroke).toEqual(feather.stroke);
        expect(featherElement.style.opacity).toEqual(feather.strokeOpacity);
        expect(drawingServiceSpy.addObject).toHaveBeenCalled();

    });
    it('#execute should add existing feather to drawing service without create a second one', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);

        const spy = spyOn(rendererServiceSpy.renderer, 'createElement');
        featherCommand['feather'] = jasmine.createSpyObj('SVGGElement', ['']);
        featherCommand.execute();
        expect(drawingServiceSpy.addObject).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();

    });
    it('#updateCurrentPath should set attribute on the current path and append the path to the feather', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);

        featherCommand['currentPath'] = rendererServiceSpy.renderer.createElement('path', 'svg');

        featherCommand.execute();
        featherCommand.updateCurrentPath([{x: 1, y: 1}, {x: 2, y: 2}]);

        expect((featherCommand['currentPath'] as SVGPathElement).getAttribute('d')).toEqual('M 1 1 L 1 1,2 2, Z');

    });
    it('#updateCurrentPath should create a new path element if there is no current path', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);

        featherCommand.execute();
        featherCommand['currentPath'] = null;

        featherCommand.updateCurrentPath([{x: 1, y: 1}, {x: 2, y: 2}]);

        expect(featherCommand['currentPath']).toBeDefined();
    });
    it('#resetPath should append current path, then create a new blank path', () => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);

        featherCommand = new FeatherCommand(rendererSpy, drawingServiceSpy, feather);
        featherCommand['currentPath'] = jasmine.createSpyObj('SVGPathElement', ['']);
        featherCommand.resetPath();
        expect(rendererSpy.appendChild).toHaveBeenCalled();
        expect(rendererSpy.createElement).toHaveBeenCalled();

    });

    it('#resetPath should not append current path it does not exist', () => {
        const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);

        featherCommand = new FeatherCommand(rendererSpy, drawingServiceSpy, feather);
        featherCommand.resetPath();
        expect(rendererSpy.appendChild).not.toHaveBeenCalled();
        expect(rendererSpy.createElement).toHaveBeenCalled();

    });
    it('#undo should remove object from drawing service if feather exists', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);
        featherCommand['feather'] = jasmine.createSpyObj('SVGPathElement', ['']);
        featherCommand.undo();
        expect(drawingServiceSpy.removeObject).toHaveBeenCalled();

    });
    it('#undo should not remove object from drawing service if feather does not exist', () => {
        featherCommand = new FeatherCommand(rendererServiceSpy.renderer, drawingServiceSpy, feather);
        featherCommand.undo();
        expect(drawingServiceSpy.removeObject).not.toHaveBeenCalled();

    });
});
