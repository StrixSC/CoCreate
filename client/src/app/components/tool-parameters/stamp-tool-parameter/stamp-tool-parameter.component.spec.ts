import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { StampToolService } from 'src/app/services/tools/stamp-tool/stamp-tool.service';
import { StampToolParameterComponent } from './stamp-tool-parameter.component';

describe('StampToolParameterComponent', () => {
  let component: StampToolParameterComponent;
  let fixture: ComponentFixture<StampToolParameterComponent>;
  let etampeService: StampToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StampToolParameterComponent],
      imports: [ReactiveFormsModule,
        MatButtonToggleModule, BrowserAnimationsModule, MaterialModules],
    })
      .compileComponents();
    etampeService = TestBed.get(StampToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch stampSvgString value in form', () => {
    component.form = new FormGroup({ stampSvgString: new FormControl('') });
    const spy = spyOn(component.form, 'patchValue');
    component.changeStamp({ value: 1 } as MatButtonToggleChange);
    expect(spy).toHaveBeenCalled();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(etampeService.toolName);
  });

  it('should return the scale value', () => {
    const form = etampeService.parameters.get('facteurSize') as FormControl;
    form.patchValue(6);
    expect(component.scaleValue).toEqual(6);
  });
});
