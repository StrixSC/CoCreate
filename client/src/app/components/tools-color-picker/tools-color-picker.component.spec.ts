import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { ToolsColorPickerComponent } from './tools-color-picker.component';

describe('ToolsColorPickerComponent', () => {
  let component: ToolsColorPickerComponent;
  let fixture: ComponentFixture<ToolsColorPickerComponent>;
  let colorPickerServiceSpy: jasmine.SpyObj<ColorPickerService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToolsColorPickerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [MatDialogModule, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useClass: class { close() { return null; } } },
        { provide: MAT_DIALOG_DATA, useValue: [] },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {

    const spyColorPicker = jasmine.createSpyObj('ColorPickerService', ['']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ColorPickerService, useValue: spyColorPicker },
      ],
    });

    colorPickerServiceSpy = TestBed.get(ColorPickerService);

    fixture = TestBed.createComponent(ToolsColorPickerComponent);
    component = fixture.componentInstance;
    component.data = { rgb: { r: 0, g: 0, b: 0 }, a: 0 };
    component.ngOnInit();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should rgba data of the component should be change on colorPickerService.colorForm change', () => {
    expect(component.data.a).toBe(0);
    colorPickerServiceSpy.colorForm.patchValue({ a: 1 });
    expect(component.data.a).toBe(1);
  });

  it('should change rgba of the colorPickerService', () => {
    expect(component.data.a).toEqual(0);
    expect(component.data.rgb).toEqual({ r: 0, g: 0, b: 0 });
    component.selectLastColor({ rgb: { r: 55, g: 55, b: 55 }, a: 1 });
    expect(colorPickerServiceSpy.a.value).toEqual(1);
    expect(colorPickerServiceSpy.rgb.value).toEqual({ r: 55, g: 55, b: 55 });
  });

  it('should close dialogRef', () => {
    const spy = spyOn(component.dialogRef, 'close');
    component.close();
    expect(spy).toHaveBeenCalled();
  });
});
