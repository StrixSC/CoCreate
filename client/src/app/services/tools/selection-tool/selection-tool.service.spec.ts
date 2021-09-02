import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { MagnetismService } from '../../magnetism/magnetism.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { GridService } from '../grid-tool/grid.service';
import { SelectionCommandConstants } from './command-type-constant';
import { SelectionToolService } from './selection-tool.service';
import { SelectionTransformService } from './selection-transform.service';

describe('SelectionToolService', () => {
    let offsetManagerServiceSpy: jasmine.SpyObj<OffsetManagerService>;
    let selectionTransfomServiceSpy: jasmine.SpyObj<SelectionTransformService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererServiceSpy: { renderer: Renderer2 };
    const svgContour = document.createElement('polygon') as Element as SVGPolygonElement;
    const svgInversement = document.createElement('polygon') as Element as SVGElement;
    const svgCtrl = document.createElement('g') as Element as SVGElement;
    let spyDrawingService: any;

    beforeEach(() => {
        const spyOffset = jasmine.createSpyObj('OffsetManagerService', ['offsetFromMouseEvent']);
        const spyGrid = jasmine.createSpyObj('GridService', ['activateMagnetism']);
        const spyMagnetism = jasmine.createSpyObj('MagnetismService', ['movementMagnetism']);
        const spySelectionTransform = jasmine.createSpyObj('SelectionTransformService', [
            'createCommand', 'rotate', 'setCtrlPointList', 'getCommandType', 'hasCommand', 'getCommand',
            'setCommandType', 'endCommand', 'setAlt', 'setShift', 'resizeWithLastOffset', 'translate', 'resize',
        ]);
        rendererSpy = jasmine.createSpyObj('Renderer2',
            ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle', 'removeChild']);
        rendererSpy.createElement.withArgs('polygon', 'svg').and.returnValue(svgContour);
        rendererSpy.createElement.withArgs('rect', 'svg').and.returnValue(svgInversement);
        rendererSpy.createElement.withArgs('g', 'svg').and.returnValue(svgCtrl);

        spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject', 'getObject', 'getObjectList']);
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawing: document.createElementNS('svg', 'svg') as SVGElement,
        };
        rendererServiceSpy = {
            renderer: rendererSpy,
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: MagnetismService, useValue: spyMagnetism },
                { provide: DrawingService, useValue: spyDrawingService },
                { provide: SelectionTransformService, useValue: spySelectionTransform },
                { provide: OffsetManagerService, useValue: spyOffset },
                { provide: GridService, useValue: spyGrid },
                { provide: RendererProviderService, useValue: rendererServiceSpy },
            ],
        });
        offsetManagerServiceSpy = TestBed.get(OffsetManagerService);
        drawingServiceSpy = TestBed.get(DrawingService);
        selectionTransfomServiceSpy = TestBed.get(SelectionTransformService);
    });

    it('should be created', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        service.onKeyDown(new KeyboardEvent('keydown'));
        service.onKeyUp(new KeyboardEvent('keyup'));
        expect(service).toBeTruthy();
        expect(TestBed.get(RendererProviderService).renderer.createElement).toHaveBeenCalledTimes(11);
    });

    it('#onPress should do nothing', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        const mouseEvent = new MouseEvent('mousedown', { button: 1 });
        service.onPressed(mouseEvent);
        expect(drawingServiceSpy.addObject).not.toHaveBeenCalled();
    });

    it('#onPress should do nothing because theres no drawing', () => {
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawing: undefined,
        };
        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            onPressed: TestBed.get(SelectionToolService).onPressed,
            removeSelection: TestBed.get(SelectionToolService).removeSelection,
            drawingService: spyDrawingService,
        };
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        service.onPressed(mouseEvent);
        expect(drawingServiceSpy.addObject).not.toHaveBeenCalled();
    });

    it('#onRelease should do nothing', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        const spy = spyOn(service, 'removeSelection');
        const mouseEvent = new MouseEvent('mousedown', { button: 1 });
        service.onRelease(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#onRelease should do nothing because theres no drawing', () => {
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawing: undefined,
        };
        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            onRelease: TestBed.get(SelectionToolService).onRelease,
            removeSelection: TestBed.get(SelectionToolService).removeSelection,
            drawingService: spyDrawingService,
        };
        const spy = spyOn(service, 'removeSelection');
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        service.onRelease(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('#onMove should do nothing', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const mouseEvent = new MouseEvent('mousedown', { buttons: 3 });

        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.getCommandType).toHaveBeenCalledTimes(0);
    });

    it('#onMove should do nothing because theres no drawing', () => {
        spyDrawingService = {
            ...spyDrawingService,
            renderer: rendererSpy,
            drawing: undefined,
        };
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service = {
            ...TestBed.get(SelectionToolService),
            onMove: TestBed.get(SelectionToolService).onMove,
            drawingService: spyDrawingService,
        };

        const mouseEvent = new MouseEvent('mousedown', { buttons: 1 });
        selectionTransfomServiceSpy.getCommandType.calls.reset();
        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.getCommandType).toHaveBeenCalledTimes(0);
    });

    it('#onMove should do nothing because theres was a rotation', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const mouseEvent = new MouseEvent('mousedown', { buttons: 1 });
        selectionTransfomServiceSpy.getCommandType.calls.reset();
        selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.ROTATE);
        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.getCommandType).toHaveBeenCalledTimes(1);
    });

    it('#onPress mouse should be inside selection', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');
        svgRect.setAttribute('x', '0');
        svgRect.setAttribute('y', '0');
        svgRect.setAttribute('width', '40');
        svgRect.setAttribute('height', '50');

        drawingServiceSpy.getObject.and.returnValue(svgRect);
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 40, 50));

        const spy = spyOn(service, 'removeSelection');

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(spy).not.toHaveBeenCalled();
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(10);
        expect(service.getObjectList().length).toEqual(1);
    });

    it('#onPress mouse should not add object because theres no object to add', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '0');
        svgRect1.setAttribute('y', '0');
        svgRect1.setAttribute('width', '20');
        svgRect1.setAttribute('height', '20');

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.setAttribute('x', '20');
        svgRect2.setAttribute('y', '20');
        svgRect2.setAttribute('width', '40');
        svgRect2.setAttribute('height', '50');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 40, y: 50 });
        service.onMove(mouseEvent);

        svgContour.setAttribute('points', '0,0 40,0 40,50 0,50');

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(2);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        drawingServiceSpy.getObject.and.returnValue(undefined);
        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(0);

        svgContour.setAttribute('points', '');
    });

    it('#onPress mouse should add object because theres less than 2 object selected', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '10');
        svgRect1.setAttribute('y', '10');
        svgRect1.setAttribute('width', '20');
        svgRect1.setAttribute('height', '20');

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.setAttribute('x', '10');
        svgRect2.setAttribute('y', '10');
        svgRect2.setAttribute('width', '40');
        svgRect2.setAttribute('height', '50');

        drawingServiceSpy.getObject.and.returnValue(svgRect1);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        const target = spyOnProperty(mouseEvent, 'target');
        target.and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 10 });
        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);
        expect(service.getObjectList().length).toEqual(1);

        target.and.returnValue(svgRect2);
        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(1);
    });

    it('#onPress mouse should not add object because theres more than 2 object selected and object is already selected', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '0');
        svgRect1.setAttribute('y', '0');
        svgRect1.setAttribute('width', '20');
        svgRect1.setAttribute('height', '20');

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.setAttribute('x', '20');
        svgRect2.setAttribute('y', '20');
        svgRect2.setAttribute('width', '40');
        svgRect2.setAttribute('height', '50');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 40, y: 50 });
        service.onMove(mouseEvent);

        svgContour.setAttribute('points', '0,0 40,0 40,50 0,50');

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(10);
        expect(service.getObjectList().length).toEqual(2);

        svgContour.setAttribute('points', '');
    });

    it('#onPress mouse should add object because theres more than 2 object selected and object is not already selected', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '0');
        svgRect1.setAttribute('y', '0');
        svgRect1.setAttribute('width', '20');
        svgRect1.setAttribute('height', '20');

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.setAttribute('x', '20');
        svgRect2.setAttribute('y', '20');
        svgRect2.setAttribute('width', '40');
        svgRect2.setAttribute('height', '50');

        const svgRect3 = document.createElement('rect') as Element as SVGElement;
        svgRect3.setAttribute('id', '3');
        svgRect3.setAttribute('x', '0');
        svgRect3.setAttribute('y', '0');
        svgRect3.setAttribute('width', '40');
        svgRect3.setAttribute('height', '50');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 40, y: 50 });
        service.onMove(mouseEvent);

        svgContour.setAttribute('points', '0,0 40,0 40,50 0,50');

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(2);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        drawingServiceSpy.getObject.and.returnValue(svgRect3);
        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(1);

        svgContour.setAttribute('points', '');
    });

    it('#onPress right click mouse should set the inverse selection', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');

        const mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);
        drawingServiceSpy.getObject.and.returnValue(svgRect);

        drawingServiceSpy.getObjectList.and.returnValue(new Map<number, SVGElement>());

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(11);
    });

    it('#onPress should get the parent node of pen', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const g = document.createElement('g') as Element as SVGGElement;
        const path = document.createElement('path') as Element as SVGPathElement;
        path.setAttribute('name', 'pen');
        g.appendChild(path);

        drawingServiceSpy.getObject.and.returnValue(path);
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(path);

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 40, 50));

        const spy = spyOn(service, 'removeSelection');

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(spy).not.toHaveBeenCalled();
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(10);
        expect(service.getObjectList().length).toEqual(1);
    });

    it('#onPress should call createCommand when clicked in a ctrlpoint', () => {
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        const svgRect = document.createElement('rect') as Element as SVGElement;

        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            onPressed: TestBed.get(SelectionToolService).onPressed,
            ctrlPoints: [svgRect],
        };

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        service.onPressed(mouseEvent);

        expect(selectionTransfomServiceSpy.createCommand).toHaveBeenCalled();
        expect(drawingServiceSpy.getObject).not.toHaveBeenCalled();
    });

    it('#onRelease mouse should empty the object list be inside selection', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');
        svgRect.setAttribute('x', '0');
        svgRect.setAttribute('y', '0');
        svgRect.setAttribute('width', '40');
        svgRect.setAttribute('height', '50');

        drawingServiceSpy.getObject.and.returnValue(svgRect);
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        svgContour.setAttribute('points', '0,0 40,0 40,50 0,50');

        service.onPressed(mouseEvent);
        expect(service.getObjectList().length).toEqual(1);

        drawingServiceSpy.getObject.and.returnValue(undefined);
        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(0);

        svgContour.setAttribute('points', '');
    });

    it('#onRelease should call endCommand and endRotation', () => {
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        let verification = 0;
        service = {
            ...TestBed.get(SelectionToolService),
            onRelease: TestBed.get(SelectionToolService).onRelease,
            wasMoved: true,
            endRotation: () => { verification++; },
            findObjects: () => { return; },
            removeSelection: () => { return; },
            removeInversement: () => { return; },
        };

        selectionTransfomServiceSpy.hasCommand.and.returnValue(true);

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });

        service.onRelease(mouseEvent);

        expect(selectionTransfomServiceSpy.endCommand).toHaveBeenCalledTimes(1);
        expect(verification).toEqual(1);
    });

    it('#onRelease should not call endCommand and call endRotation', () => {
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        let verification = 0;
        service = {
            ...TestBed.get(SelectionToolService),
            onRelease: TestBed.get(SelectionToolService).onRelease,
            wasMoved: true,
            endRotation: () => { verification++; },
            findObjects: () => { return; },
            removeSelection: () => { return; },
            removeInversement: () => { return; },
        };

        selectionTransfomServiceSpy.hasCommand.and.returnValue(false);

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });

        service.onRelease(mouseEvent);

        expect(selectionTransfomServiceSpy.endCommand).not.toHaveBeenCalledTimes(1);
        expect(verification).toEqual(1);
    });

    it('#setSelection should set selection around 1 object', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');
        svgRect.setAttribute('x', '4');
        svgRect.setAttribute('y', '4');
        svgRect.setAttribute('width', '34');
        svgRect.setAttribute('height', '44');
        svgRect.style.stroke = 'black';
        svgRect.style.strokeWidth = '4';

        drawingServiceSpy.getObject.and.returnValue(svgRect);
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        service.onPressed(mouseEvent);
        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '-2,-2 0,-2 2,-2 2,0 2,2 0,2 -2,2 -2,0');
    });

    it('#setSelection should set selection around 4 object', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.style.stroke = 'black';
        svgRect1.style.strokeWidth = '0';
        spyOn(svgRect1, 'getBoundingClientRect').and.callFake(() => new DOMRect(0, 5, 5, 5));

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.style.stroke = 'black';
        svgRect2.style.strokeWidth = '4';
        spyOn(svgRect2, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 0, 5, 5));

        const svgRect3 = document.createElement('rect') as Element as SVGElement;
        svgRect3.setAttribute('id', '3');
        svgRect3.style.stroke = 'black';
        svgRect3.style.strokeWidth = '6';
        spyOn(svgRect3, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 10, 5, 5));

        const svgRect4 = document.createElement('rect') as Element as SVGRectElement;
        svgRect4.setAttribute('id', '4');
        svgRect4.style.stroke = 'black';
        svgRect4.style.strokeWidth = '8';
        spyOn(svgRect4, 'getBoundingClientRect').and.returnValue(new DOMRect(10, 5, 5, 5));

        const svgRect5 = document.createElement('rect') as Element as SVGElement;
        svgRect5.setAttribute('id', '5');
        svgRect4.style.stroke = 'none';
        svgRect4.style.strokeWidth = '2';
        spyOn(svgRect5, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 5, 5, 5));

        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 100, 100));

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);
        objList.set(3, svgRect3);
        objList.set(4, svgRect4);
        objList.set(5, svgRect5);

        drawingServiceSpy.getObjectList.and.returnValue(objList);
        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '0,-2 7.5,-2 15,-2 15,8 15,18 7.5,18 0,18 0,8');
    });

    it('#setSelection should set selection with a marker', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.style.stroke = 'none';
        svgRect1.style.strokeWidth = '0';
        svgRect1.setAttribute('id', '3');
        svgRect1.setAttribute('marker-start', 'url(#50---salut-60)');
        spyOn(svgRect1, 'getBoundingClientRect').and.callFake(() => new DOMRect(0, 5, 5, 5));

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.style.stroke = 'black';
        svgRect2.style.strokeWidth = '4';
        svgRect2.setAttribute('id', '4');
        svgRect2.setAttribute('marker-start', 'url(#100-allo-80)');
        spyOn(svgRect2, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 0, 5, 5));

        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 100, 100));

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '-45,-50 7.5,-50 60,-50 60,2.5 60,55 7.5,55 -45,55 -45,2.5');
    });

    it('#onMove should call translate command and create command', () => {
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service = {
            ...TestBed.get(SelectionToolService),
            onMove: TestBed.get(SelectionToolService).onMove,
            setSelection: () => { return; },
            rectSelection: svgContour,
            isIn: true,
        };

        selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.NONE);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1, movementX: 2, movementY: 3 });

        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.translate).toHaveBeenCalledTimes(1);
        expect(selectionTransfomServiceSpy.createCommand).toHaveBeenCalledTimes(1);
    });

    it('#onMove should call translate command and not create command', () => {
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service = {
            ...TestBed.get(SelectionToolService),
            onMove: TestBed.get(SelectionToolService).onMove,
            setSelection: () => { return; },
            rectSelection: svgContour,
            isIn: true,
        };

        selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.TRANSLATE);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1, movementX: 2, movementY: 3 });

        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.translate).toHaveBeenCalledTimes(1);
        expect(selectionTransfomServiceSpy.createCommand).not.toHaveBeenCalled();
    });

    it('#onMove should call resize command and not translate command', () => {
        let service: SelectionToolService;
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        service = {
            ...TestBed.get(SelectionToolService),
            onMove: TestBed.get(SelectionToolService).onMove,
            setSelection: () => { return; },
            rectSelection: svgContour,
            isIn: true,
        };

        selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.RESIZE);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1, movementX: 2, movementY: 3 });

        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.resize).toHaveBeenCalledTimes(1);
        expect(selectionTransfomServiceSpy.translate).not.toHaveBeenCalled();
    });

    it('#moveObjects should not call translate command and call setSizeOfSelectionArea', () => {
        let service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });
        let verifier = 0;
        service = {
            ...TestBed.get(SelectionToolService),
            onMove: TestBed.get(SelectionToolService).onMove,
            setSizeOfSelectionArea: () => { verifier++; },
            rectSelection: svgContour,
            isIn: false,
        };

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1, movementX: 2, movementY: 3 });

        service.onMove(mouseEvent);

        expect(selectionTransfomServiceSpy.translate).not.toHaveBeenCalled();
        expect(verifier).toEqual(1);
    });

    it('#findObjects should fond the object inside de selection rectangle and select it', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgDefs = document.createElement('defs') as Element as SVGElement;
        svgDefs.setAttribute('id', '1');
        svgDefs.setAttribute('tagName', 'defs');

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '2');
        svgRect.style.stroke = 'black';
        svgRect.style.strokeWidth = '0';
        spyOn(svgRect, 'getBoundingClientRect').and.callFake(() => new DOMRect(0, 5, 5, 5));

        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 100, 100));

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgDefs);
        objList.set(2, svgRect);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(1);
    });

    it('#findObjects should find the objects inside de invertion rectangle and select them', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '0');
        svgRect1.setAttribute('y', '0');
        svgRect1.setAttribute('width', '5');
        svgRect1.setAttribute('height', '5');
        svgRect1.style.stroke = 'black';
        svgRect1.style.strokeWidth = '0';
        spyOn(svgRect1, 'getBoundingClientRect').and.callFake(() => new DOMRect(0, 0, 5, 5));

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.style.stroke = 'black';
        svgRect2.style.strokeWidth = '4';
        spyOn(svgRect2, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 0, 5, 5));

        const svgRect3 = document.createElement('rect') as Element as SVGElement;
        svgRect3.setAttribute('id', '3');
        svgRect3.style.stroke = 'black';
        svgRect3.style.strokeWidth = '6';
        spyOn(svgRect3, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 10, 5, 5));

        spyOn(svgInversement, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 100, 100));

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);
        objList.set(3, svgRect3);

        drawingServiceSpy.getObjectList.and.returnValue(objList);
        drawingServiceSpy.getObject.and.returnValue(svgRect1);

        const mouseEvent = new MouseEvent('mousedown', { button: 2, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 2, y: 2 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(3);
    });

    it('#findObjects should find the object inside de invertion rectangle and unselect it', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect1 = document.createElement('rect') as Element as SVGElement;
        svgRect1.setAttribute('id', '1');
        svgRect1.setAttribute('x', '0');
        svgRect1.setAttribute('y', '0');
        svgRect1.setAttribute('width', '5');
        svgRect1.setAttribute('height', '5');
        svgRect1.style.stroke = 'black';
        svgRect1.style.strokeWidth = '0';
        spyOn(svgRect1, 'getBoundingClientRect').and.callFake(() => new DOMRect(0, 0, 5, 5));

        const svgRect2 = document.createElement('rect') as Element as SVGElement;
        svgRect2.setAttribute('id', '2');
        svgRect2.style.stroke = 'black';
        svgRect2.style.strokeWidth = '4';
        spyOn(svgRect2, 'getBoundingClientRect').and.returnValue(new DOMRect(5, 5, 5, 5));

        const svgRect3 = document.createElement('rect') as Element as SVGElement;
        svgRect3.setAttribute('id', '3');
        svgRect3.style.stroke = 'black';
        svgRect3.style.strokeWidth = '6';
        spyOn(svgRect3, 'getBoundingClientRect').and.returnValue(new DOMRect(30, 30, 5, 5));

        const bound = spyOn(svgInversement, 'getBoundingClientRect');
        bound.and.returnValue(new DOMRect(0, 0, 100, 100));

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect1);
        objList.set(2, svgRect2);
        objList.set(3, svgRect3);

        drawingServiceSpy.getObjectList.and.returnValue(objList);
        drawingServiceSpy.getObject.and.returnValue(svgRect1);

        const mouseEvent = new MouseEvent('mousedown', { button: 2, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect1);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 2, y: 2 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(3);

        bound.and.returnValue(new DOMRect(0, 0, 20, 20));

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 2, y: 2 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 100, y: 100 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(service.getObjectList().length).toEqual(1);
    });

    it('#setSize set size of object on mouse move', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect);
        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 50, y: 60 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 60, y: 80 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '50.5,60.5 55,60.5 59.5,60.5 59.5,70 59.5,79.5 55,79.5 50.5,79.5 50.5,70');
    });

    it('#setSize set size of object to 0 on mouse move with negative height and width', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect);
        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 50, y: 60 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 50, y: 60 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '50.5,60.5 50.5,60.5 50.5,60.5 50.5,60.5 50.5,60.5 50.5,60.5 50.5,60.5 50.5,60.5');
    });

    it('#setSize set size of object to positive value on mouse move with negative height and width', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect);
        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 0, buttons: 1 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 50, y: 60 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 40, y: 40 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '40.5,40.5 45,40.5 49.5,40.5 49.5,50 49.5,59.5 45,59.5 40.5,59.5 40.5,50');
    });

    it('#setSize with right click set size of object', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const svgRect = document.createElement('rect') as Element as SVGElement;
        svgRect.setAttribute('id', '1');

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect);
        drawingServiceSpy.getObjectList.and.returnValue(objList);

        const mouseEvent = new MouseEvent('mousedown', { button: 2, buttons: 2 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 50, y: 60 });
        service.onPressed(mouseEvent);

        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 60, y: 80 });
        service.onMove(mouseEvent);

        service.onRelease(mouseEvent);

        expect(TestBed.get(RendererProviderService).renderer.setAttribute)
            .toHaveBeenCalledWith(svgContour, 'points', '0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0');
    });

    it('#setNewSelection to set selection on 1 object on 2', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        const svgDefs = document.createElement('defs') as Element as SVGElement;

        const objList = [svgRect, svgDefs];

        service.setNewSelection(objList);

        expect(service.getObjectList().length).toEqual(1);
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(10);
    });

    it('#setNewSelection to not set selection', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        const objList: SVGElement[] = [];

        service.setNewSelection(objList);

        expect(service.getObjectList().length).toEqual(0);
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(8);
    });

    it('#selectAll to set selection on 1 object on 2', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        const svgDefs = document.createElement('defs') as Element as SVGElement;

        const objList = new Map<number, SVGElement>();
        objList.set(1, svgRect);
        objList.set(2, svgDefs);

        drawingServiceSpy.getObjectList.and.returnValue(objList);

        service.selectAll();

        expect(service.getObjectList().length).toEqual(1);
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(10);
    });

    it('#selectAll to not set selection', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        drawingServiceSpy.getObjectList.and.returnValue(new Map<number, SVGElement>());

        service.selectAll();

        expect(service.getObjectList().length).toEqual(0);
        expect(TestBed.get(RendererProviderService).renderer.appendChild).toHaveBeenCalledTimes(8);
    });

    it('#hasSelection should return false', () => {
        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            hasSelection: TestBed.get(SelectionToolService).hasSelection,
            objects: [],
        };

        expect(service.hasSelection()).toBeFalsy();
    });

    it('#hasSelection should return true', () => {
        const svgRect = document.createElement('rect') as Element as SVGElement;

        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            hasSelection: TestBed.get(SelectionToolService).hasSelection,
            objects: [svgRect],
        };

        expect(service.hasSelection()).toBeTruthy();
    });

    it('#getRectSelectionOffset should return first point', () => {
        let service: SelectionToolService;
        service = {
            ...TestBed.get(SelectionToolService),
            getRectSelectionOffset: TestBed.get(SelectionToolService).getRectSelectionOffset,
            pointsList: [{ x: 2, y: 3 }, { x: 4, y: 5 }, { x: 6, y: 7 }, { x: 8, y: 9 }],
        };

        expect(service.getRectSelectionOffset()).toEqual({ x: 2, y: 3 });
    });

    it('#pickupTool only returns', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        service.pickupTool();
        expect().nothing();
    });

    it('#dropTool only returns', () => {
      const service: SelectionToolService = TestBed.get(SelectionToolService);
      service.dropTool();
      expect().nothing();
    });

    it('#rotationAction should create a command and rotate', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        selectionTransfomServiceSpy.createCommand.and.callFake(() => {
            selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.ROTATE);
        });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 40, 50));

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);
        service.onPressed(mouseEvent);

        window.dispatchEvent(new WheelEvent('wheel'));

        expect(selectionTransfomServiceSpy.createCommand).toHaveBeenCalled();
        expect(selectionTransfomServiceSpy.rotate).toHaveBeenCalled();
    });

    it('#rotationAction should create a command and not rotate', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 10, y: 12 });

        selectionTransfomServiceSpy.createCommand.and.callFake(() => {
            selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.TRANSLATE);
        });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 40, 50));

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);
        service.onPressed(mouseEvent);

        window.dispatchEvent(new WheelEvent('wheel'));

        expect(selectionTransfomServiceSpy.createCommand).toHaveBeenCalled();
        expect(selectionTransfomServiceSpy.rotate).not.toHaveBeenCalled();
    });

    it('#rotationAction should create a command, rotate and set size due to shift pressed', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);
        offsetManagerServiceSpy.offsetFromMouseEvent.and.returnValue({ x: 0, y: 0 });

        selectionTransfomServiceSpy.createCommand.and.callFake(() => {
            selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.ROTATE);
        });

        const svgRect = document.createElement('rect') as Element as SVGElement;
        const spy = spyOn(svgRect, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0, 0, 0));
        spyOn(svgContour, 'getBoundingClientRect').and.returnValue(new DOMRect(1, 1, 40, 50));

        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgRect);
        drawingServiceSpy.getObject.and.returnValue(svgRect);
        service.onPressed(mouseEvent);

        service.onKeyDown(new KeyboardEvent('keydown', { code: KeyCodes.shiftL }));
        spy.calls.reset();
        window.dispatchEvent(new WheelEvent('wheel'));

        expect(selectionTransfomServiceSpy.createCommand).toHaveBeenCalled();
        expect(selectionTransfomServiceSpy.rotate).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('#onKeyUp should set Alt to false but not shift', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        service.onKeyDown(new KeyboardEvent('keydown', { code: KeyCodes.altL }));
        expect(selectionTransfomServiceSpy.setAlt).toHaveBeenCalledWith(true);
        expect(selectionTransfomServiceSpy.setShift).not.toHaveBeenCalled();

        service.onKeyUp(new KeyboardEvent('keydown', { code: KeyCodes.altL }));
        expect(selectionTransfomServiceSpy.setAlt).toHaveBeenCalledWith(false);
        expect(selectionTransfomServiceSpy.setShift).toHaveBeenCalledWith(false);
    });

    it('#onKeyUp should set shift to false but not alt', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        service.onKeyDown(new KeyboardEvent('keydown', { code: KeyCodes.shiftL }));
        expect(selectionTransfomServiceSpy.setShift).toHaveBeenCalledWith(true);
        expect(selectionTransfomServiceSpy.setAlt).not.toHaveBeenCalled();

        service.onKeyUp(new KeyboardEvent('keydown', { code: KeyCodes.shiftL }));
        expect(selectionTransfomServiceSpy.setAlt).toHaveBeenCalledWith(false);
        expect(selectionTransfomServiceSpy.setShift).toHaveBeenCalledWith(false);
    });

    it('#onKeyUp should call resizeWithLastOffset', () => {
        const service: SelectionToolService = TestBed.get(SelectionToolService);

        selectionTransfomServiceSpy.getCommandType.and.returnValue(SelectionCommandConstants.RESIZE);

        service.onKeyDown(new KeyboardEvent('keydown'));
        service.onKeyUp(new KeyboardEvent('keydown'));

        expect(selectionTransfomServiceSpy.resizeWithLastOffset).toHaveBeenCalledTimes(2);
    });
    it('#hideSelection should set visibility to hidden', () => {

        const service: SelectionToolService = TestBed.get(SelectionToolService);
        service.hideSelection();
            // disabled pour tester l'etat des attributs prives
    /*  tslint:disable:disable-next-line: no-string-literal */
        expect(rendererServiceSpy.renderer.setAttribute).toHaveBeenCalledWith(service['ctrlG'], 'visibility', 'hidden');
    });
    it('#showSelection should set visibility to visible', () => {

        const service: SelectionToolService = TestBed.get(SelectionToolService);
        service.showSelection();
        expect(rendererServiceSpy.renderer.setAttribute).toHaveBeenCalledWith(service['ctrlG'], 'visibility', 'visible');
    });
});
