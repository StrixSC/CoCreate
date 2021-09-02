import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl, FormGroup } from '@angular/forms';
import { RGB, RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { ColorTransformerService } from 'src/app/services/color-transformer/color-transformer.service';
import { ColorPickerService } from '../color-picker.service';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
  let component: ColorPaletteComponent;
  let fixture: ComponentFixture<ColorPaletteComponent>;
  let colorTransformerServiceSpy: jasmine.SpyObj<ColorTransformerService>;
  let hslFormGroup: FormGroup;
  let rgbTestValue: RGB;

  beforeEach(async(() => {
    hslFormGroup = new FormGroup({
      h: new FormControl(20), s: new FormControl(1), l: new FormControl(1),
    });
    const cTSSpy = jasmine.createSpyObj(
      'ColorTransformerService',
      ['hue2rgb'],
    );
    TestBed.configureTestingModule({
      declarations: [ColorPaletteComponent],
      providers: [
        { provide: ColorTransformerService, useValue: cTSSpy },
        {
          provide: ColorPickerService, useClass: class {
            hsl: FormGroup = hslFormGroup;
          },
        }],
    }).compileComponents();
    rgbTestValue = {
      r: Math.round(Math.random() * RGB_MAX_VALUE),
      g: Math.round(Math.random() * RGB_MAX_VALUE),
      b: Math.round(Math.random() * RGB_MAX_VALUE),
    };
    colorTransformerServiceSpy = TestBed.get(ColorTransformerService);
    colorTransformerServiceSpy.hue2rgb.and.returnValue(rgbTestValue);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('afterViewInit should call draw', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.ngAfterViewInit();
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should draw on hsl update', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    hslFormGroup.setValue({ h: 50, s: 0.5, l: 0.1 });
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update s and l value on mousedown', () => {
    const mouseEvent = new MouseEvent('mousedown');
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 2);
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 4);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(hslFormGroup.value.s).toEqual(0.5);
    expect(hslFormGroup.value.l).toEqual(0.25);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update s and l value on mousedown with position outside element', () => {
    const mouseEvent = new MouseEvent('mousedown');
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(component.canvas.nativeElement.width * 2);
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(component.canvas.nativeElement.height * 4);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(hslFormGroup.value.s).toEqual(1);
    expect(hslFormGroup.value.l).toEqual(1);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update s and l value on mousedown with position outside element', () => {
    const mouseEvent = new MouseEvent('mousedown');
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(-2);
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(-2);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(hslFormGroup.value.s).toEqual(0);
    expect(hslFormGroup.value.l).toEqual(0);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should not update s and l if mousedown not called before mouse move', () => {
    const mouseEvent = new MouseEvent('mousemove');
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 2);
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 2);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent);
    expect(hslFormGroup.value.s).toEqual(1);
    expect(hslFormGroup.value.l).toEqual(1);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should update s and l if mousedown is called before mouse move', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    spyOnProperty(mouseEvent1, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 2);
    spyOnProperty(mouseEvent1, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 4);
    component.onMouseDown(mouseEvent1);
    const mouseEvent2 = new MouseEvent('mousemove');
    spyOnProperty(mouseEvent2, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 4);
    spyOnProperty(mouseEvent2, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 2);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent2);
    expect(hslFormGroup.value.s).toEqual(0.25);
    expect(hslFormGroup.value.l).toEqual(0.5);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should release the mouse input on on mouse up', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    spyOnProperty(mouseEvent1, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 2);
    spyOnProperty(mouseEvent1, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 4);
    component.onMouseDown(mouseEvent1);

    const mouseEvent = new MouseEvent('mouseup');
    const spy = spyOn(component, 'onMouseUp').and.callThrough();
    window.dispatchEvent(mouseEvent);

    const mouseEvent2 = new MouseEvent('mousemove');
    spyOnProperty(mouseEvent2, 'offsetX').and.returnValue(component.canvas.nativeElement.width / 4);
    spyOnProperty(mouseEvent2, 'offsetY').and.returnValue(component.canvas.nativeElement.height / 2);
    const drawSpy = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent2);
    expect(hslFormGroup.value.s).toEqual(0.5);
    expect(hslFormGroup.value.l).toEqual(0.25);
    expect(spy).toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });
});
