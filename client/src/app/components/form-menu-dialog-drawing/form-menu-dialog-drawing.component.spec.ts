import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMenuDialogDrawingComponent } from './form-menu-dialog-drawing.component';

describe('FormMenuDialogDrawingComponent', () => {
  let component: FormMenuDialogDrawingComponent;
  let fixture: ComponentFixture<FormMenuDialogDrawingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormMenuDialogDrawingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMenuDialogDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
