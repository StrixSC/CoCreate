import { TestBed } from '@angular/core/testing';

import { CollaborationPasswordFormService } from './collaboration-password-form.service';

describe('CollaborationPasswordFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollaborationPasswordFormService = TestBed.get(CollaborationPasswordFormService);
    expect(service).toBeTruthy();
  });
});
