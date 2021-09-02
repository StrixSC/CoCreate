import { TestBed } from '@angular/core/testing';

import { ElementRef } from '@angular/core';
import { HEIGHT_OFFSET, WorkspaceService } from './workspace.service';

class MockElementRef {
  nativeElement = { offsetWidth: 20, offsetHeight: 40 };
}

describe('WorkspaceService', () => {
  let elRef: ElementRef;
  let service: WorkspaceService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: ElementRef, useValue: new MockElementRef()}],
    });
    elRef = TestBed.get(ElementRef);
    service = TestBed.get(WorkspaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 0 for width and height if el is not defined', () => {
    expect(service.width).toBe(0);
    expect(service.height).toBe(0);
  });

  it('should return el width and height for width and height if scrolledElement is defined', () => {
    service.scrolledElement = elRef;
    // spyOnProperty(service, 'scrolledElement', 'get').and.returnValue({ nativeElement: { offsetWidth: 20, offsetHeight: 40 }});
    expect(service.width).toBe(20);
    expect(service.height).toBe(40 - HEIGHT_OFFSET);
  });
});
