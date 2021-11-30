import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingGalleryComponent } from './drawing-gallery.component';

describe('DrawingGalleryComponent', () => {
  let component: DrawingGalleryComponent;
  let fixture: ComponentFixture<DrawingGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawingGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
