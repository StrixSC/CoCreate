import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from '../../app-material.module';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    open: null,
    close: null,
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModules, NoopAnimationsModule],
      declarations: [ErrorMessageComponent],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpyObj }, {
        provide: MAT_DIALOG_DATA,
        useValue: {
          title: 'title',
          description: 'description',
        },
      }],
    })
      .compileComponents();
    spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#close should close the dialog', () => {
    component.close();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
