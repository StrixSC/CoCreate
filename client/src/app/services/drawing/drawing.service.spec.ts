import { Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_RGB_COLOR, RGB } from 'src/app/model/rgb.model';
import { RGBA } from 'src/app/model/rgba.model';
import { RendererProviderService } from '../renderer-provider/renderer-provider.service';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    const rgbColor: RGB = DEFAULT_RGB_COLOR;
    const alpha = 1;
    let service: DrawingService;
    let rendererSpy: jasmine.SpyObj<Renderer2>;
    let rendererProviderService: RendererProviderService;

    beforeEach(() => {
        rendererSpy = jasmine.createSpyObj('Renderer2',
            ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle', 'insertBefore', 'removeChild']);

        TestBed.configureTestingModule({
            providers: [{ provide: Renderer2, useValue: rendererSpy }, RendererProviderService],
        });
        service = TestBed.get(DrawingService);

        rendererSpy = TestBed.get(Renderer2);
        rendererProviderService = TestBed.get(RendererProviderService);
        service.renderer = rendererSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#rgbaColorString should return rgba color in string', () => {
        service.color = rgbColor;
        service.alpha = alpha;
        const rgbaString = 'rgba(' + rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b + ',' + alpha + ')';
        expect(service.rgbaColorString).toBe(rgbaString);
    });

    it('#rgbColorString should return rgba color in string', () => {
        service.color = rgbColor;
        const rgbString = 'rgb(' + rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b + ')';
        expect(service.rgbColorString).toBe(rgbString);
    });

    it('#addObject should add new object with good id', () => {
        service.drawing = document.createElement('svg') as Element as SVGElement;
        const lastId = service.lastObjectId;
        const obj = document.createElementNS('svg', 'svg') as SVGElement;
        const retId = service.addObject(obj);
        expect(retId).toBe(lastId);
    });

    it('#addObject should add new object with his id', () => {
        service.drawing = document.createElement('svg') as Element as SVGElement;
        const obj = document.createElementNS('svg', 'svg') as SVGElement;
        obj.id = '5';
        const retId = service.addObject(obj);
        expect(retId).toBe(5);
    });

    it('#getObjectList should return the objectList', () => {
        service.drawing = document.createElement('svg') as Element as SVGElement;
        const obj1 = document.createElementNS('svg', 'svg') as SVGElement;
        const retId = service.addObject(obj1);
        const obj2 = service.getObjectList();
        expect(obj2.size).toEqual(1);
        expect(obj2.get(retId)).toEqual(obj1);
    });

    it('#removeObject should remove object when called', () => {
        service.drawing = document.createElement('svg') as Element as SVGElement;
        const obj = document.createElementNS('svg', 'svg') as SVGElement;
        const retId = service.addObject(obj);
        let retObj = service.getObject(retId);
        expect(retObj).toEqual(obj);
        service.removeObject(retId);
        retObj = service.getObject(retId);
        expect(retObj).toBeUndefined();
    });

    it('#setDimension should set dimension', () => {
        service.setDimension(10, 20);
        expect(service.width).toBe(10);
        expect(service.height).toBe(20);
    });

    it('#setDrawingColor should set drawingColor', () => {
        service.setDrawingColor({ rgb: { r: 20, g: 230, b: 100 }, a: 0.8 });
        expect(service.alpha).toBe(0.8);
        expect(service.color).toEqual({ r: 20, g: 230, b: 100 });
    });

    it('#setDrawingColor should set drawingColor to the drawing', () => {
        service.drawing = document.createElementNS('svg', 'svg') as SVGElement;
        const spy = rendererSpy.setStyle.and.callThrough();
        service.setDrawingColor({ rgb: { r: 20, g: 230, b: 100 }, a: 0.8 });
        expect(service.alpha).toBe(0.8);
        expect(service.color).toEqual({ r: 20, g: 230, b: 100 });
        expect(spy).toHaveBeenCalled();
    });

    it('#newDrawing should reset the drawing for a new drawing', () => {
        const spy = rendererSpy.createElement.and.returnValue(document.createElementNS('svg', 'svg'));
        let called = false;
        service.drawingEmit.subscribe(() => { called = true; });
        service.newDrawing(140, 202, { rgb: { r: 20, g: 230, b: 100 }, a: 0.8 });
        expect(service.alpha).toBe(0.8);
        expect(service.color).toEqual({ r: 20, g: 230, b: 100 });
        expect(service.lastObjectId).toBe(0);
        expect(called).toBeTruthy();
        spy.calls.reset();

    });

    it('#openDrawing should open a new drawing', () => {
        const backGroundColor: RGBA = { rgb: { r: 150, g: 200, b: 120 }, a: 0.8 };
        const setDrawingColor = spyOn(service, 'setDrawingColor');
        const spy = rendererSpy.createElement.and.returnValue(document.createElementNS('svg', 'svg'));
        service.drawingEmit.subscribe((d: SVGElement) => {
            expect(d).toBeDefined();
        });
        const svg: SVGElement = rendererProviderService.renderer.createElement('svg', 'svg');
        rendererProviderService.renderer.setAttribute(svg, 'width', '100');
        rendererProviderService.renderer.setAttribute(svg, 'height', '100');
        rendererProviderService.renderer.setStyle(svg, 'backgroundColor', 'rgba(150,200,120,0.8)');
        rendererProviderService.renderer.appendChild(svg, rendererProviderService.renderer.createElement('rect', 'svg'));
        service.openDrawing(svg);
        expect(setDrawingColor).toHaveBeenCalledWith(backGroundColor);
        expect(service.objects.size).toEqual(1);
        expect(service.lastObjectId).toEqual(0);
        spy.calls.reset();
    });

    it('#openDrawing should remove a child', () => {
        const backGroundColor: RGBA = { rgb: { r: 150, g: 200, b: 120 }, a: 0.8 };
        const setDrawingColor = spyOn(service, 'setDrawingColor');
        const spy = rendererSpy.createElement.and.returnValue(document.createElementNS('svg', 'svg'));
        service.drawingEmit.subscribe((d: SVGElement) => {
            expect(d).toBeDefined();
        });
        const svg: SVGElement = rendererProviderService.renderer.createElement('svg', 'svg');
        rendererProviderService.renderer.setAttribute(svg, 'width', '120');
        rendererProviderService.renderer.setAttribute(svg, 'height', '200');
        rendererProviderService.renderer.setStyle(svg, 'backgroundColor', 'rgba(150,200,120,0.8)');
        rendererProviderService.renderer.appendChild(svg, rendererProviderService.renderer.createElement('rect', 'svg'));
        service.openDrawing(svg);
        expect(setDrawingColor).toHaveBeenCalledWith(backGroundColor);
        expect(service.objects.size).toEqual(1);
        expect(service.lastObjectId).toEqual(0);
        spy.calls.reset();
    });

    it('isSaved should return saved if true', () => {
        service.saved = true;
        expect(service.isSaved).toBeTruthy();
    });

    it('isSaved should return isCreated if false', () => {
        service.saved = false;
        expect(service.isSaved).toBe(!service.isCreated);
    });
});
