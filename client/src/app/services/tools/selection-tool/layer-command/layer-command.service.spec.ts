import { TestBed } from '@angular/core/testing';

import { LayerCommandService } from './layer-command.service';

describe('LayerCommandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LayerCommandService = TestBed.get(LayerCommandService);
    expect(service).toBeTruthy();
  });
});
