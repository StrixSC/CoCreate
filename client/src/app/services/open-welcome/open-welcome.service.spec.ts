import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material';
import { of } from 'rxjs';
import { WelcomeDialogService } from '../welcome-dialog/welcome-dialog.service';
import { OpenWelcomeService } from './open-welcome.service';

describe('OpenWelcomeService', () => {
  let messageActivated: FormControl;
  let dialogSpy: jasmine.Spy;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(() => {
    messageActivated = new FormControl(true);
    let welcomeSpy = jasmine.createSpyObj('WelcomeDialogService', ['']);
    welcomeSpy = {
      ...welcomeSpy,
      messageActivated,
    };

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [OpenWelcomeService, { provide: WelcomeDialogService, useValue: welcomeSpy }],
    });
    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
  });

  it('service should be created', () => {
    const service: OpenWelcomeService = TestBed.get(OpenWelcomeService);
    expect(service).toBeTruthy();
  });

  it(`should call on openDialog '`, () => {
    const service: OpenWelcomeService = TestBed.get(OpenWelcomeService);
    service.openDialog();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`should call on openDialog if message Activated is true'`, () => {
    const service: OpenWelcomeService = TestBed.get(OpenWelcomeService);
    service.openOnStart();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it(`should not call on openDialog if message Activated is false'`, () => {
    const service: OpenWelcomeService = TestBed.get(OpenWelcomeService);
    messageActivated.setValue(false);
    service.openOnStart();
    expect(dialogSpy).not.toHaveBeenCalled();
  });
});
