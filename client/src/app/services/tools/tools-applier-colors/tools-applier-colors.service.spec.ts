import { TestBed } from '@angular/core/testing';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { ToolsApplierColorsService } from './tools-applier-colors.service';

describe('ToolsApplierColorsService', () => {
    let svgElement: SVGRectElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RendererProviderService,
                { provide: ToolsColorService, useValue: { primaryColorString: 'rgb(100,200,50)', primaryAlpha: 0.6 } },
            ],
        });

        const rendererService: RendererProviderService = TestBed.get(RendererProviderService);
        svgElement = rendererService.renderer.createElement('rect', 'svg');
        rendererService.renderer.setAttribute(svgElement, 'name', 'rectangle');
        rendererService.renderer.setProperty(svgElement, 'id', '0');
        rendererService.renderer.setStyle(svgElement, 'fill', 'rgb(0,0,0)');
        rendererService.renderer.setStyle(svgElement, 'fillOpacity', '0');
        rendererService.renderer.setStyle(svgElement, 'stroke', 'rgb(0,0,0)');
        rendererService.renderer.setStyle(svgElement, 'strokeOpacity', '0');
    });

    it('should be created', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        expect(service).toBeTruthy();
    });

    it('should change primary color on button 0', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        let mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgElement);
        service.onPressed(mouseEvent);
        mouseEvent = new MouseEvent('mouseup', { button: 0 });
        const command = service.onRelease(mouseEvent);
        expect(command).toBeDefined();
        expect(svgElement.style.fill).toEqual('rgb(100, 200, 50)');
        expect(svgElement.style.fillOpacity).toEqual('0.6');
        expect(svgElement.style.stroke).toEqual('rgb(0, 0, 0)');
        expect(svgElement.style.strokeOpacity).toEqual('0');
    });

    it('should change secondary color on button 2', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        let mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgElement);
        service.onPressed(mouseEvent);
        mouseEvent = new MouseEvent('mouseup', { button: 2 });
        const command = service.onRelease(mouseEvent);
        expect(command).toBeDefined();
        expect(svgElement.style.stroke).toEqual('rgb(100, 200, 50)');
        expect(svgElement.style.strokeOpacity).toEqual('0.6');
        expect(svgElement.style.fill).toEqual('rgb(0, 0, 0)');
        expect(svgElement.style.fillOpacity).toEqual('0');
    });

    it('should change primary color on button 0 and do nothing else if second release', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        let mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgElement);
        service.onPressed(mouseEvent);
        mouseEvent = new MouseEvent('mouseup', { button: 0 });
        let command = service.onRelease(mouseEvent);
        expect(command).toBeDefined();
        expect(svgElement.style.fill).toEqual('rgb(100, 200, 50)');
        expect(svgElement.style.fillOpacity).toEqual('0.6');
        expect(svgElement.style.stroke).toEqual('rgb(0, 0, 0)');
        expect(svgElement.style.strokeOpacity).toEqual('0');
        command = service.onRelease(mouseEvent);
        expect(command).toBeUndefined();
    });

    it('should switch target if name is pen', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        let svgPathElement: SVGPathElement;
        let svgGElement: SVGGElement;
        const rendererService: RendererProviderService = TestBed.get(RendererProviderService);
        svgPathElement = rendererService.renderer.createElement('path', 'svg');
        rendererService.renderer.setAttribute(svgPathElement, 'name', 'pen');
        svgGElement = rendererService.renderer.createElement('g', 'svg');
        rendererService.renderer.setProperty(svgGElement, 'id', '0');
        rendererService.renderer.setStyle(svgGElement, 'stroke', 'rgb(0,0,0)');
        rendererService.renderer.setStyle(svgGElement, 'opacity', '0');
        rendererService.renderer.appendChild(svgGElement, svgPathElement);

        let mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOnProperty(mouseEvent, 'target').and.returnValue(svgPathElement);
        service.onPressed(mouseEvent);
        mouseEvent = new MouseEvent('mouseup', { button: 0 });
        const command = service.onRelease(mouseEvent);
        expect(command).toBeDefined();
        expect(svgGElement.style.stroke).toEqual('rgb(0, 0, 0)');
        expect(svgGElement.style.opacity).toEqual('0');
    });

    it('should do nothing if on pressed is not called first', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        let mouseEvent = new MouseEvent('mousemove', { button: 0 });
        service.onMove(mouseEvent);
        mouseEvent = new MouseEvent('mouseup', { button: 0 });
        let command = service.onRelease(mouseEvent);
        expect(command).toBeUndefined();
        service.onKeyUp(new KeyboardEvent('keyup'));
        command = service.onRelease(mouseEvent);
        expect(command).toBeUndefined();
        service.onKeyDown(new KeyboardEvent('keydown'));
        command = service.onRelease(mouseEvent);
        expect(command).toBeUndefined();
        expect(svgElement.style.fill).toEqual('rgb(0, 0, 0)');
        expect(svgElement.style.fillOpacity).toEqual('0');
        expect(svgElement.style.stroke).toEqual('rgb(0, 0, 0)');
        expect(svgElement.style.strokeOpacity).toEqual('0');
    });

    it('should do nothing on pickupTool', () => {
        const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
        const result = service.pickupTool();
        expect(result).toBeUndefined();
    });

    it('should do nothing on dropTool', () => {
      const service: ToolsApplierColorsService = TestBed.get(ToolsApplierColorsService);
      const result = service.dropTool();
      expect(result).toBeUndefined();
    });
});
