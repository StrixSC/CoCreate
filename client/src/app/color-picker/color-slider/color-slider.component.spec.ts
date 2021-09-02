import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MAX_HUE } from 'src/app/model/hsl.model';
import { ColorPickerService } from '../color-picker.service';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorOpacityComponent', () => {
  let component: ColorSliderComponent;
  let fixture: ComponentFixture<ColorSliderComponent>;
  let hslFormGroup: FormGroup;
  let h: FormControl;

  beforeEach(async(() => {
    h = new FormControl(20);
    hslFormGroup = new FormGroup({
      h, s: new FormControl(1), l: new FormControl(1),
    });
    TestBed.configureTestingModule({
      declarations: [ColorSliderComponent],
      providers: [
        {
          provide: ColorPickerService, useClass: class {
            hsl: FormGroup = hslFormGroup;
          },
        }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('a and hsl should come from colorPickerService', () => {
    expect(component.hue).toEqual(h);
  });

  it('#afterViewInit should call draw', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.ngAfterViewInit();
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should draw on hue update', () => {
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    hslFormGroup.setValue({ h: 50, s: 0.5, l: 0.1 });
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update hue on mouse down with valide inside the element', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.canvas.nativeElement.height / 4;
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.hue.value).toBe(Math.round(0.25 * MAX_HUE));
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update hue on mouse down with value above the element height', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.canvas.nativeElement.height * 1.5;
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.hue.value).toBe(MAX_HUE);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update hue on mouse down with value below the element', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = -2;
    spyOnProperty(mouseEvent, 'offsetY').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseDown(mouseEvent);
    expect(component.hue.value).toBe(0);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should update hue on mouse move where the mouse input is active', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    let mouseOffset = component.canvas.nativeElement.height / 2;
    spyOnProperty(mouseEvent1, 'offsetY').and.returnValue(mouseOffset);
    component.onMouseDown(mouseEvent1);
    const mouseEvent2 = new MouseEvent('mousemove');
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    mouseOffset = component.canvas.nativeElement.height / 4;
    spyOnProperty(mouseEvent2, 'offsetY').and.returnValue(mouseOffset);
    component.onMouseMove(mouseEvent2);
    expect(component.hue.value).toBe(MAX_HUE / 4);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('should not update hue on mouse move where the mouse input is active', () => {
    const mouseEvent = new MouseEvent('mousedown');
    const mouseOffset = component.canvas.nativeElement.height / 2;
    spyOnProperty(mouseEvent, 'offsetX').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent);
    expect(component.hue.value).toBe(20);
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('should disabled mouse move input on mouse event up', () => {
    const mouseEvent1 = new MouseEvent('mousedown');
    let mouseOffset = component.canvas.nativeElement.height / 2;
    spyOnProperty(mouseEvent1, 'offsetY').and.returnValue(mouseOffset);
    component.onMouseDown(mouseEvent1);
    const mouseEvent = new MouseEvent('mouseup');
    const spy = spyOn(component, 'onMouseUp').and.callThrough();
    window.dispatchEvent(mouseEvent);
    expect(spy).toHaveBeenCalled();
    const mouseEvent2 = new MouseEvent('mousemove');
    mouseOffset = component.canvas.nativeElement.height / 4;
    spyOnProperty(mouseEvent2, 'offsetY').and.returnValue(mouseOffset);
    const drawSpy: jasmine.Spy<() => void> = spyOn(component, 'draw');
    component.onMouseMove(mouseEvent2);
    expect(component.hue.value).toBe(MAX_HUE / 2);
    expect(drawSpy).not.toHaveBeenCalled();
  });

});
