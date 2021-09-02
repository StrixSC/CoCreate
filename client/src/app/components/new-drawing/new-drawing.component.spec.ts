import { Overlay } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { GridService } from 'src/app/services/tools/grid-tool/grid.service';
import { NewDrawingAlertComponent } from './new-drawing-alert/new-drawing-alert.component';
import { NewDrawingComponent } from './new-drawing.component';

describe('NewDrawingComponent', () => {
  let component: NewDrawingComponent;
  let fixture: ComponentFixture<NewDrawingComponent>;
  let dialogSpy: jasmine.Spy;
  let gridServiceSpy: jasmine.SpyObj<GridService>;
  let rendererSpy: jasmine.SpyObj<Renderer2>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<NewDrawingAlertComponent>>;

  beforeEach(async(() => {
    dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of({}),
      afterOpened: of({}),
      open: null,
      close: null,
    });
    dialogRefSpyObj.componentInstance = { body: '' };
    let spyGridService = jasmine.createSpyObj('GridService', ['hideGrid']);
    spyGridService = {
      ...
      spyGridService,
      activateGrid: new FormControl(false),
    };

    rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
    let spyDrawingService = jasmine.createSpyObj('DrawingService', ['addObject', 'removeObject', 'newDrawing', 'width', 'height']);
    spyDrawingService = {
      ...spyDrawingService,
      renderer: rendererSpy,
      width: 0,
      height: 0,
    };

    TestBed.configureTestingModule({
      imports: [MaterialModules, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [NewDrawingComponent],
      providers: [Overlay, MatSnackBar,

        { provide: DrawingService, useValue: spyDrawingService },
        { provide: MatDialogRef, useValue: dialogRefSpyObj },
        { provide: GridService, useValue: spyGridService },

      ],
    });
    TestBed.compileComponents();

    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    drawingServiceSpy = TestBed.get(DrawingService);
    gridServiceSpy = TestBed.get(GridService);
    drawingServiceSpy.drawing = document.createElementNS('svg', 'svg') as SVGElement;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create new drawing component', () => {
    expect(component).toBeTruthy();
  });

  it('should not call dialog.open on the first time onAccept is called', () => {
    component.onAccept();
    expect(dialogSpy).not.toHaveBeenCalled();
  });

  it('should call dialog.open and dialog.close on the second time onAccept is called', () => {
    component.onAccept();
    component.onAccept();
    expect(dialogSpy).toHaveBeenCalled();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  // it('should not call dialog.close on the second time onAccept is called', () => {
  //   // ...
  // });

  it('should not call the newDrawing on close of the alert', () => {
    drawingServiceSpy.isCreated = true;
    dialogRefSpyObj.afterClosed.and.returnValue(of(false));
    component.onAccept();
    fixture.detectChanges();
    expect(drawingServiceSpy.newDrawing).not.toHaveBeenCalled();
  });

  it('should call hide the grid if grid was activated', () => {
    gridServiceSpy.activateGrid.setValue(true);
    drawingServiceSpy.isCreated = true;
    dialogRefSpyObj.afterClosed.and.returnValue(of(true));
    component.onAccept();
    fixture.detectChanges();
    expect(drawingServiceSpy.newDrawing).toHaveBeenCalled();
  });

  it('should call dialogRef.close onCancel', () => {
    component.onCancel();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});
