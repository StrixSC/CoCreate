import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { ToolsColorService } from 'src/app/services/tools-color/tools-color.service';
import { ToolsColorComponent } from './tools-color.component';

describe('ToolsColorComponent', () => {
  let component: ToolsColorComponent;
  let fixture: ComponentFixture<ToolsColorComponent>;
  let toolsColorServiceSpy: jasmine.SpyObj<ToolsColorService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({ rgb: { r: 200, g: 200, b: 200 }, a: 1 }),
    close: null,
    updatePosition: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(async(() => {
    const spyToolsColor = jasmine.createSpyObj('ToolsColorService', ['switchColor', 'setPrimaryColor', 'setSecondaryColor']);
    const spyDrawingService = jasmine.createSpyObj('DrawingService', ['setDrawingColor']);
    TestBed.configureTestingModule({
      declarations: [ToolsColorComponent],
      imports: [MatDialogModule, BrowserAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: ToolsColorService, useValue: spyToolsColor },
      { provide: DrawingService, useValue: spyDrawingService },
      ],
    });
    spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    toolsColorServiceSpy = TestBed.get(ToolsColorService);
    drawingServiceSpy = TestBed.get(DrawingService);
    fixture = TestBed.createComponent(ToolsColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call switchColor', () => {
    component.switchColor();
    expect(toolsColorServiceSpy.switchColor).toHaveBeenCalled();
  });

  it('should call clickPrimary;', () => {
    const spy = spyOn(component, 'openDialog').and.returnValue();
    component.clickPrimary(new MouseEvent('mousedown'));
    expect(spy).toHaveBeenCalled();
  });

  it('should call clickSecondary', () => {
    const spy = spyOn(component, 'openDialog').and.returnValue();
    component.clickSecondary(new MouseEvent('mousedown'));
    expect(spy).toHaveBeenCalled();
  });

  it('should call clickBackground', () => {
    const spy = spyOn(component, 'openDialog').and.returnValue();
    component.clickBackground(new MouseEvent('mousedown'));
    expect(spy).toHaveBeenCalled();
  });

  it('should open PrimaryColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of({ rgb: { r: 200, g: 200, b: 200 }, a: 1 }));
    component.openDialog(0);
    expect(toolsColorServiceSpy.setPrimaryColor).toHaveBeenCalled();
  });

  it('should not open PrimaryColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of(null));
    component.openDialog(0);
    expect(toolsColorServiceSpy.setPrimaryColor).not.toHaveBeenCalled();
  });

  it('should open SecondaryColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of({ rgb: { r: 200, g: 200, b: 200 }, a: 1 }));
    component.openDialog(1);
    expect(toolsColorServiceSpy.setSecondaryColor).toHaveBeenCalled();
  });

  it('should not open SecondaryColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of(null));
    component.openDialog(1);
    expect(toolsColorServiceSpy.setSecondaryColor).not.toHaveBeenCalled();
  });

  it('should open BackgroundColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of({ rgb: { r: 200, g: 200, b: 200 }, a: 1 }));
    component.openDialog(2);
    expect(drawingServiceSpy.setDrawingColor).toHaveBeenCalled();
  });

  it('should not open BackgroundColorDialog', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of(null));
    component.openDialog(2);
    expect(drawingServiceSpy.setDrawingColor).not.toHaveBeenCalled();
  });

  it('should not open any dialog', () => {
    component.openDialog(20);
    expect(toolsColorServiceSpy.setPrimaryColor).not.toHaveBeenCalled();
    expect(toolsColorServiceSpy.setSecondaryColor).not.toHaveBeenCalled();
    expect(drawingServiceSpy.setDrawingColor).not.toHaveBeenCalled();
  });
});
