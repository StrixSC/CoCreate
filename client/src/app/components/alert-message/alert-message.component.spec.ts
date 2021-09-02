import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from '../../app-material.module';
import { AlertMessageComponent } from './alert-message.component';

describe('AlertMessageComponent', () => {
  let component: AlertMessageComponent;
  let fixture: ComponentFixture<AlertMessageComponent>;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    open: null,
    close: () => { return; },
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModules, NoopAnimationsModule],
      declarations: [AlertMessageComponent],
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
    fixture = TestBed.createComponent(AlertMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#close should close the dialog', () => {
    component.close();
    expect(dialogRefSpyObj.close).toHaveBeenCalled();
  });
});
