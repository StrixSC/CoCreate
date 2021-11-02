import { TestBed } from '@angular/core/testing';

import { SynchronizeDrawingService } from './synchronize-drawing.service';

describe('SynchronizeDrawingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SynchronizeDrawingService = TestBed.get(SynchronizeDrawingService);
    expect(service).toBeTruthy();
  });
});
