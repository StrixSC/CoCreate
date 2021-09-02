import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { ExportService } from 'src/app/services/export/export.service';
import { ExportDrawingComponent } from './export-drawing.component';

describe('ExportDrawingComponent', () => {
  let injector: TestBed;
  let component: ExportDrawingComponent;
  let fixture: ComponentFixture<ExportDrawingComponent>;
  let exportServiceSpy: jasmine.SpyObj<ExportService>;

  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };
  beforeEach(async(() => {

    const spyExportService: jasmine.Spy = jasmine.createSpyObj('ExportService', ['exportToFormat']);

    TestBed.configureTestingModule({
      imports: [MaterialModules, FormsModule, ReactiveFormsModule, BrowserAnimationsModule],
      declarations: [ ExportDrawingComponent ],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpyObj },
        {provide: ExportService, useValue: spyExportService},

      ],
    })
    .compileComponents();
    injector = getTestBed();
    exportServiceSpy = injector.get(ExportService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('#export should call exportToFormat from export service with the selection value', () => {
    const mockFormat = 'BMP';
    component.selectionInput.value = mockFormat;
    component.export();
    expect(exportServiceSpy.exportToFormat).toHaveBeenCalled();

  });
  it('#close should close dialog', () => {
    const dialogRef = TestBed.get(MatDialogRef);
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
});
});
