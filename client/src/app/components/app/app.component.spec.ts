import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from '../../app-material.module';
import { AppComponent } from './app.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { WelcomeDialogService } from 'src/app/services/welcome-dialog/welcome-dialog.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let welcomeDialogService: WelcomeDialogService;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(async(() => {
    // const spyWelcome = jasmine.createSpyObj('WelcomeDialogService', ['']);
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModules,
      ],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpyObj }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    // welcomeServiceSpy = TestBed.get(WelcomeDialogService);
    spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    welcomeDialogService = TestBed.get(WelcomeDialogService);
    TestBed.compileComponents();
  }));

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not call the welcome message if the service return false', () => {
    spyOnProperty(welcomeDialogService, 'shouldWelcomeMessageBeShown').and.returnValue(false);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    const openSpy = spyOn(component, 'openDialog').and.returnValue();
    fixture.detectChanges();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should call the welcome message if the service return false', () => {
    spyOnProperty(welcomeDialogService, 'shouldWelcomeMessageBeShown').and.returnValue(true);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    const openSpy = spyOn(component, 'openDialog').and.returnValue();
    fixture.detectChanges();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should open a dialog on openDialog', () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.openDialog();
    expect(component.dialog.open).toHaveBeenCalled();
  });

  /*it('should create the app', () => {
    welcomeServiceSpy.form.setValue({ messageActivated: false });
    const spy = spyOn(component, 'openDialog');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });*/
});
