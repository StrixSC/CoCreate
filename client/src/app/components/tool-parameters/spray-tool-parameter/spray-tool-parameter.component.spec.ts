import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { SprayToolService } from 'src/app/services/tools/spray-tool/spray-tool.service';
import { SprayToolParameterComponent } from './spray-tool-parameter.component';

describe('SprayToolParameterComponent', () => {
  let component: SprayToolParameterComponent;
  let fixture: ComponentFixture<SprayToolParameterComponent>;
  let sprayToolService: SprayToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprayToolParameterComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
    })
    .compileComponents();
    sprayToolService = TestBed.get(SprayToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprayToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(sprayToolService.toolName);
  });

  it('should return the diameter value', () => {
    const form = sprayToolService.parameters.get('diameter') as FormControl;
    form.patchValue(6);
    expect(component.diameter).toEqual(6);
  });

  it('should return the emision per second value', () => {
    const form = sprayToolService.parameters.get('emissionPerSecond') as FormControl;
    form.patchValue(6);
    expect(component.emissionPerSecond).toEqual(6);
  });

  it('should return the circle radus value', () => {
    const form = sprayToolService.parameters.get('circleRadius') as FormControl;
    form.patchValue(6);
    expect(component.circleRadius).toEqual(6);
  });

});
