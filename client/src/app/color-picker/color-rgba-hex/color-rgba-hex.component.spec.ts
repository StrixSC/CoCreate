import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { ColorPickerService } from '../color-picker.service';
import { ColorRgbaHexComponent } from './color-rgba-hex.component';

describe('ColorRgbaHexComponent', () => {
  let component: ColorRgbaHexComponent;
  let fixture: ComponentFixture<ColorRgbaHexComponent>;
  let form: FormGroup;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    form = formBuilder.group({
      hsl: formBuilder.group({
        h: 180,
        s: 1,
        l: 1,
      }),
      rgb: formBuilder.group({
        r: 0,
        g: 0,
        b: 0,
      }),
      a: 1,
      hex: '#ffffff',
    });
    TestBed.configureTestingModule({
      declarations: [ColorRgbaHexComponent],
      imports: [
        CommonModule,
        MaterialModules,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ColorPickerService, useClass: class {
            colorForm: FormGroup = form;
            get rgb(): FormGroup {
              return (this.colorForm.get('rgb') as FormGroup);
            }
          },
        },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorRgbaHexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init with the form from the service', () => {
    expect(component.colorForm).toEqual(form);
    expect(component.rgb).toEqual(form.get('rgb') as FormGroup);
  });
});
