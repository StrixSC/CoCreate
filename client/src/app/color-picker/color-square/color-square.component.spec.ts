import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RGB } from 'src/app/model/rgb.model';
import { ColorPickerService } from '../color-picker.service';
import { ColorSquareComponent } from './color-square.component';

describe('ColorSquareComponent', () => {
  let component: ColorSquareComponent;
  let fixture: ComponentFixture<ColorSquareComponent>;
  const a = 0.7;
  const rgb: RGB = { r: 20, g: 255, b: 160 };

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColorSquareComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        {
          provide: ColorPickerService, useClass: class {
            a = { value: a };
            rgb = { value: rgb };
          },
        },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rgbString should come from service', () => {
    expect(component.rgbString).toBe('rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
  });

  it('a should come from service', () => {
    expect(component.a).toBe(a);
  });
});
