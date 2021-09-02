import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { PenToolService } from 'src/app/services/tools/pen-tool/pen-tool.service';
import { PenToolParameterComponent } from './pen-tool-parameter.component';

describe('PenToolParameterComponent', () => {
  let component: PenToolParameterComponent;
  let fixture: ComponentFixture<PenToolParameterComponent>;
  let penToolService: PenToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PenToolParameterComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
    })
    .compileComponents();
    penToolService = TestBed.get(PenToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(penToolService.toolName);
  });

  it('should return the min stroke width value', () => {
    const form = penToolService.parameters.get('minStrokeWidth') as FormControl;
    form.patchValue(6);
    expect(component.minStrokeWidthValue).toEqual(6);
  });

  it('should return the max stroke width value', () => {
    const form = penToolService.parameters.get('maxStrokeWidth') as FormControl;
    form.patchValue(6);
    expect(component.maxStrokeWidthValue).toEqual(6);
  });
});
