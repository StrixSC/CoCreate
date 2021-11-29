import { TestBed } from '@angular/core/testing';

import { DrawingGalleryService } from './drawing-gallery.service';

describe('DrawingGalleryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DrawingGalleryService = TestBed.get(DrawingGalleryService);
    expect(service).toBeTruthy();
  });
});
