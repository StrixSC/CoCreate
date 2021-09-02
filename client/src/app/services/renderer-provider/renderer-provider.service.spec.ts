import { TestBed } from '@angular/core/testing';

import { RendererProviderService } from './renderer-provider.service';

describe('RendererFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RendererProviderService = TestBed.get(RendererProviderService);
    expect(service).toBeTruthy();
  });
});
