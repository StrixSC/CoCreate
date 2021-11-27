import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDrawingFormDialogComponent } from './new-drawing-form-dialog.component';

describe('DrawingPreviewDialogComponent', () => {
  let component: NewDrawingFormDialogComponent;
  let fixture: ComponentFixture<NewDrawingFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDrawingFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDrawingFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
