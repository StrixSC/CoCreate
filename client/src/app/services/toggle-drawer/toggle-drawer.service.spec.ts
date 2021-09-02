import { TestBed } from '@angular/core/testing';

import { ToggleDrawerService } from './toggle-drawer.service';

describe('ToggleDrawerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToggleDrawerService = TestBed.get(ToggleDrawerService);
    expect(service).toBeTruthy();
  });

  it('should close the drawer when it is opened when close is called', () => {
    const service: ToggleDrawerService = TestBed.get(ToggleDrawerService);
    service.isOpened = true;
    service.close();
    expect(service.isOpened).toBe(false);
  });

  it('should not change the status of the drawer when it is closed and close is called', () => {
    const service: ToggleDrawerService = TestBed.get(ToggleDrawerService);
    service.isOpened = false;
    service.close();
    expect(service.isOpened).toBe(false);
  });

  it('should not change the status of the drawer when it is opened and open is called', () => {
    const service: ToggleDrawerService = TestBed.get(ToggleDrawerService);
    service.isOpened = true;
    service.open();
    expect(service.isOpened).toBe(true);
  });

  it('should open the drawer when it is closed when open is called', () => {
    const service: ToggleDrawerService = TestBed.get(ToggleDrawerService);
    service.isOpened = false;
    service.open();
    expect(service.isOpened).toBe(true);
  });
});
