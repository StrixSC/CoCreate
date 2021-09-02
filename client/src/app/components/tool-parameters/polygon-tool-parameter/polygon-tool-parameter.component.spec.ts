import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PolygonToolService } from 'src/app/services/tools/polygon-tool/polygon-tool.service';
import { PolygonToolParameterComponent } from './polygon-tool-parameter.component';

describe('PolygonToolParameterComponent', () => {
  let component: PolygonToolParameterComponent;
  let fixture: ComponentFixture<PolygonToolParameterComponent>;
  let polygonToolService: PolygonToolService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PolygonToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule,
        MatButtonToggleModule, ],
    })
      .compileComponents();
    polygonToolService = TestBed.get(PolygonToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygonToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch polygon value in form', () => {
    component.form = new FormGroup({ polygonStyle: new FormControl('fill') });
    const spy = spyOn(component.form, 'patchValue').and.callThrough();
    component.selectStyle(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(polygonToolService.toolName);
  });
});
