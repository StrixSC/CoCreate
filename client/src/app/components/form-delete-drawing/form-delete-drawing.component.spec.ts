import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDeleteDrawingComponent } from './form-delete-drawing.component';

describe('FormDeleteDrawingComponent', () => {
  let component: FormDeleteDrawingComponent;
  let fixture: ComponentFixture<FormDeleteDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDeleteDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDeleteDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
