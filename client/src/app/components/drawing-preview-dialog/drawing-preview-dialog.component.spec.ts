import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingPreviewDialogComponent } from './drawing-preview-dialog.component';

describe('DrawingPreviewDialogComponent', () => {
  let component: DrawingPreviewDialogComponent;
  let fixture: ComponentFixture<DrawingPreviewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingPreviewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
