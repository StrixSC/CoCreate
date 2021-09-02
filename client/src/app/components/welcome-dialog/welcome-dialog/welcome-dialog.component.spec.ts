import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { MaterialModules } from 'src/app/app-material.module';
import { WelcomeDialogService } from 'src/app/services/welcome-dialog/welcome-dialog.service';
import { IndexService } from '../../../services/index/index.service';
import { WelcomeDialogComponent } from './welcome-dialog.component';

describe('DialogComponent', () => {
  let component: WelcomeDialogComponent;
  let fixture: ComponentFixture<WelcomeDialogComponent>;
  let indexServiceSpy: SpyObj<IndexService>;
  const welcomeDialogService: WelcomeDialogService = new WelcomeDialogService();
  const mockDialogRef = { close: jasmine.createSpy('close') };
  const form: FormGroup = new FormGroup({
    messageActivated: new FormControl(false),
  });
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(() => {
    indexServiceSpy = jasmine.createSpyObj('IndexService', ['welcomeGet']);
    indexServiceSpy.welcomeGet.and.returnValue(of({ body: '', end: '' }));

  });

  beforeEach(async(() => {
    welcomeDialogService.form = form;
    TestBed.configureTestingModule({
      imports: [MaterialModules, BrowserAnimationsModule, ReactiveFormsModule, FormsModule],
      declarations: [WelcomeDialogComponent],
      providers: [
        WelcomeDialogComponent, { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: IndexService, useValue: indexServiceSpy }, { provide: WelcomeDialogService, useValue: welcomeDialogService }],
    });
    spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dialog component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    component.closeClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call openDialog when aide button is clicked', fakeAsync(() => {
    spyOn(component, 'openDialog').and.callThrough();
    const aideButton = fixture.debugElement.query(By.css('button[id=buttonOpen]'));
    aideButton.triggerEventHandler('click', null);
    expect(component.openDialog).toHaveBeenCalled();
  }));

  it('should form equal to my service form', fakeAsync(() => {
    expect(component.form).toEqual(form);
  }));
});
