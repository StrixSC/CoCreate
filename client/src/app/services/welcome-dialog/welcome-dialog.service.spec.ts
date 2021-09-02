import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WelcomeDialogService } from './welcome-dialog.service';

describe('WelcomeDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('service should be created', () => {
    const service: WelcomeDialogService = TestBed.get(WelcomeDialogService);
    expect(service).toBeTruthy();
  });

  it('form should be created ', () => {
    const service: WelcomeDialogService = TestBed.get(WelcomeDialogService);
    expect(service.form.get('messageActivated')).toBeTruthy();
  });

  it('should return true if value is true shouldWelcomeMessageBeShown ', () => {
    sessionStorage.setItem('showWelcomeMessage', 'true');
    const service: WelcomeDialogService = TestBed.get(WelcomeDialogService);
    expect(service.shouldWelcomeMessageBeShown).toBeTruthy();
  });

  it('should return false if value is true shouldWelcomeMessageBeShown ', () => {
    sessionStorage.setItem('showWelcomeMessage', 'false');
    const service: WelcomeDialogService = TestBed.get(WelcomeDialogService);
    expect(service.shouldWelcomeMessageBeShown).not.toBeTruthy();
  });

  it('should call subscribe change value', fakeAsync(() => {
    const service: WelcomeDialogService = TestBed.get(WelcomeDialogService);
    service.form.setValue({ messageActivated: 'false' });
    tick(20);
    expect(sessionStorage.getItem('showWelcomeMessage')).toBe('false');
  }));

});
