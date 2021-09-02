
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { LineToolService } from 'src/app/services/tools/line-tool/line-tool.service';
import { LineToolParameterComponent } from './line-tool-parameter.component';

describe('LineToolParameterComponent', () => {
  let component: LineToolParameterComponent;
  let fixture: ComponentFixture<LineToolParameterComponent>;
  let lineToolService: LineToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LineToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
    })
    .compileComponents();
    lineToolService = TestBed.get(LineToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(lineToolService.toolName);
  });

  it('should return the stroke width value', () => {
    const formStrokeWidth = lineToolService.parameters.get('strokeWidth') as FormControl;
    formStrokeWidth.patchValue(6);
    expect(component.strokeWidthValue).toEqual(6);
  });

  it('should return the diameter value', () => {
    const formDiameter = lineToolService.parameters.get('diameter') as FormControl;
    formDiameter.patchValue(6);
    expect(component.diameter).toEqual(6);
  });

  it('should call selectStyleJonction', () => {
    const formDiameter = lineToolService.parameters.get('diameter') as FormControl;
    formDiameter.patchValue(0);
    const spyJonction = spyOn(lineToolService, 'selectStyleJonction').and.callThrough();
    component.selectStyleJonction(1);
    expect(spyJonction).toHaveBeenCalled();
  });

  it('should call selectStyleMotif', () => {
    const form = lineToolService.parameters.get('diameter') as FormControl;
    form.patchValue(0);
    const spyMotif = spyOn(lineToolService, 'selectStyleMotif').and.callThrough();
    component.selectStyleMotif(1);
    expect(spyMotif).toHaveBeenCalled();
  });

});
