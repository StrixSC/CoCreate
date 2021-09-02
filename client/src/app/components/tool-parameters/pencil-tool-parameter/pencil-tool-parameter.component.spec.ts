import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { PencilToolService } from 'src/app/services/tools/pencil-tool/pencil-tool.service';
import { PencilToolParameterComponent } from './pencil-tool-parameter.component';

describe('PencilToolParameterComponent', () => {
  let component: PencilToolParameterComponent;
  let fixture: ComponentFixture<PencilToolParameterComponent>;
  let pencilToolService: PencilToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PencilToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
    })
    .compileComponents();
    pencilToolService = TestBed.get(PencilToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PencilToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(pencilToolService.toolName);
  });

  it('should return the stroke width value', () => {
    const form = pencilToolService.parameters.get('strokeWidth') as FormControl;
    form.patchValue(6);
    expect(component.strokeWidthValue).toEqual(6);
  });
});
