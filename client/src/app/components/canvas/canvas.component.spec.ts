import { Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingService } from '../../services/drawing/drawing.service';
import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

  let rendererSpy: jasmine.SpyObj<Renderer2>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CanvasComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const rendererSpyTemp = jasmine.createSpyObj('Renderer2',
      ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle', 'removeChild']);
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['']);
    spyDrawingService = {
      ...spyDrawingService,
      renderer: rendererSpyTemp,
    };
    TestBed.configureTestingModule({
      providers: [{ provide: Renderer2, useValue: rendererSpyTemp }, { provide: DrawingService, useValue: spyDrawingService }],
      declarations: [CanvasComponent],
    });
    drawingServiceSpy = TestBed.get(DrawingService);

    fixture = TestBed.createComponent(CanvasComponent);
    // tslint:disable-next-line: deprecation
    rendererSpy = fixture.componentRef.injector.get(Renderer2);
    spyOn(rendererSpy, 'removeChild');
    spyOn(rendererSpy, 'appendChild');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return dimension value when service created value is true', () => {
    drawingServiceSpy.isCreated = true;
    drawingServiceSpy.height = 100;
    drawingServiceSpy.width = 100;
    expect(component.height).toEqual(100);
    expect(component.width).toEqual(100);
  });

  it('should return 0 when service created value is false ', () => {
    drawingServiceSpy.isCreated = false;
    expect(component.height).toEqual(0);
    expect(component.width).toEqual(0);
  });

  it('should return background alpha value', () => {
    drawingServiceSpy.alpha = 9;
    expect(component.backgroundAlpha).toEqual(9);
  });

  it('should return drawingServicecolor value', () => {
    spyOnProperty(drawingServiceSpy, 'rgbaColorString').and.returnValue('rgba(255,0,0,1)');
    expect(component.backgroundColor).toEqual('rgba(255,0,0,1)');
  });

  it('should return value of isDrawingCreated ', () => {
    drawingServiceSpy.isCreated = true;
    expect(component.isDrawingCreated).toEqual(true);

    drawingServiceSpy.isCreated = false;
    expect(component.isDrawingCreated).toEqual(false);
  });

  it(' ngAfterView should be called with no svg', () => {
    const el: SVGElement = document.createElementNS('svg', 'svg') as SVGElement;
    component.ngAfterViewInit();
    drawingServiceSpy.drawingEmit.emit(el);
    fixture.detectChanges();
    expect(rendererSpy.appendChild).toHaveBeenCalledWith(component.canvasDiv.nativeElement, el);
  });

  it(' ngAfterView should be called with svg', () => {
    const previousel: SVGElement = document.createElementNS('svg', 'svg') as SVGElement;
    const el: SVGElement = document.createElementNS('svg', 'svg') as SVGElement;
    component.svg = previousel;
    component.ngAfterViewInit();
    drawingServiceSpy.drawingEmit.emit(el);
    fixture.detectChanges();
    expect(rendererSpy.removeChild).toHaveBeenCalledWith(component.canvasDiv.nativeElement, previousel);
    expect(rendererSpy.appendChild).toHaveBeenCalledWith(component.canvasDiv.nativeElement, el);
  });

});
