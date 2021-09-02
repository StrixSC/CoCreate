import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RGB, RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { ColorTransformerService } from 'src/app/services/color-transformer/color-transformer.service';
import { ColorPickerService } from '../color-picker.service';
import { ColorOpacityComponent } from './color-opacity.component';

describe('ColorOpacityComponent', () => {
  let component: ColorOpacityComponent;
  let fixture: ComponentFixture<ColorOpacityComponent>;
  let colorTransformerServiceSpy: jasmine.SpyObj<ColorTransformerService>;
  let rgbTestValue: RGB;
  let hslFormGroup: FormGroup;
  let aFormControl: FormControl;
  const aInitialValue = 0.8;

  beforeEach(async(() => {
    hslFormGroup = new FormGroup({
      h: new FormControl(20), s: new FormControl(1), l: new FormControl(1),
    });
    aFormControl = new FormControl(aInitialValue);
    const cTSSpy = jasmine.createSpyObj(
      'ColorTransformerService',
      ['hsl2rgb'],
    );
    TestBed.configureTestingModule({
      declarations: [ColorOpacityComponent],
      providers: [
        { provide: ColorTransformerService, useValue: cTSSpy },
        {
          provide: ColorPickerService, useClass: class {
            hsl: FormGroup = hslFormGroup;
            a: FormControl = aFormControl;
          },
        }],
    }).compileComponents();
    rgbTestValue = {
      r: Math.round(Math.random() * RGB_MAX_VALUE),
      g: Math.round(Math.random() * RGB_MAX_VALUE),
      b: Math.round(Math.random() * RGB_MAX_VALUE),
    };
    colorTransformerServiceSpy = TestBed.get(ColorTransformerService);
    colorTransformerServiceSpy.hsl2rgb.and.returnValue(rgbTestValue);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorOpacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('a and hsl should come from colorPickerService', () => {
    expect(component.a).toEqual(aFormControl);
    expect(component.hsl).toEqual(hslFormGroup);
  });

  it('afterViewInit should call draw', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.ngAfterViewInit();
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should draw on hsl update', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.hsl.setValue({ h: 50, s: 0.5, l: 0.1 });
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should draw on a update', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.a.setValue(0.75);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update opacity on mouse down', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.opacityCanvas.nativeElement.width / 2;
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.a.value).toBe(0.5);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update opacity on mouse down', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.opacityCanvas.nativeElement.width + 5;
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.a.value).toBe(1);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update opacity on mouse down', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = -2;
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.a.value).toBe(0);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update opacity on mouse down', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    let mouseOffset = component.opacityCanvas.nativeElement.width / 2;
    spyOnProperty(mouseEvent1, 'offsetX').and.returnValue(mouseOffset);
    component.onMouseDown(mouseEvent1);
    const mouseEvent2 = new MouseEvent('mousemove');
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    mouseOffset = component.opacityCanvas.nativeElement.width / 4;
    spyOnProperty(mouseEvent2, 'offsetX').and.returnValue(mouseOffset);
    component.onMouseMove(mouseEvent2);
    expect(component.a.value).toBe(0.25);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update opacity on mouse down', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.opacityCanvas.nativeElement.width / 2;
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent);
    expect(component.a.value).toBe(aInitialValue);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should disabled mouse move input on mouse event up', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    let mouseOffset = component.opacityCanvas.nativeElement.width / 2;
    spyOnProperty(mouseEvent1, 'offsetX').and.returnValue(mouseOffset);
    component.onMouseDown(mouseEvent1);
    const mouseEvent = new MouseEvent('mouseup');
    const spy = spyOn(component, 'onMouseUp').and.callThrough();
    window.dispatchEvent(mouseEvent);
    expect(spy).toHaveBeenCalled();
    const mouseEvent2 = new MouseEvent('mousemove');
    mouseOffset = component.opacityCanvas.nativeElement.width / 4;
    spyOnProperty(mouseEvent2, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent2);
    expect(component.a.value).toBe(0.5);
    expect(drawSpy).not.toHaveBeenCalled();
  });

});
