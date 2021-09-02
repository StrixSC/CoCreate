import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ToolEllipseService } from 'src/app/services/tools/tool-ellipse/tool-ellipse.service';
import { EllipseToolParameterComponent } from './ellipse-tool-parameter.component';

describe('RectangleToolParameterComponent', () => {
  let component: EllipseToolParameterComponent;
  let fixture: ComponentFixture<EllipseToolParameterComponent>;
  let ellipseToolService: ToolEllipseService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EllipseToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule,
        MatButtonToggleModule, ],
    })
      .compileComponents();
    ellipseToolService = TestBed.get(ToolEllipseService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EllipseToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch ellipse value in form', () => {
    component.form = new FormGroup({ ellipseStyle: new FormControl('fill') });
    const spy = spyOn(component.form, 'patchValue');
    component.selectStyle(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(ellipseToolService.toolName);
  });
});
