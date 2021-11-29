import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingGalleryCardProtectedComponent } from './drawing-gallery-card-protected.component';

describe('DrawingGalleryCardProtectedComponent', () => {
  let component: DrawingGalleryCardProtectedComponent;
  let fixture: ComponentFixture<DrawingGalleryCardProtectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingGalleryCardProtectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingGalleryCardProtectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
