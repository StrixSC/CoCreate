import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ToolRectangleService } from 'src/app/services/tools/tool-rectangle/tool-rectangle.service';
import { RectangleToolParameterComponent } from './rectangle-tool-parameter.component';

describe('RectangleToolParameterComponent', () => {
  let component: RectangleToolParameterComponent;
  let fixture: ComponentFixture<RectangleToolParameterComponent>;
  let rectangleToolService: ToolRectangleService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RectangleToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule,
        MatButtonToggleModule, ],
    })
      .compileComponents();
    rectangleToolService = TestBed.get(ToolRectangleService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RectangleToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch rect value in form', () => {
    component.form = new FormGroup({ rectStyle: new FormControl('fill') });
    const spy = spyOn(component.form, 'patchValue');
    component.selectStyle(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(rectangleToolService.toolName);
  });
});
