import { HttpClientModule } from '@angular/common/http';
import { Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatDialog,
  MatDialogRef,
  MatOption,
  MatTableDataSource
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'ngx-moment';
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { OpenDrawingService } from 'src/app/services/open-drawing/open-drawing.service';
import { TagService } from 'src/app/services/tag/tag.service';
import { Drawing } from '../../../../../common/communication/drawing';
import { OpenDrawingComponent } from './open-drawing.component';

describe('OpenDrawingComponent', () => {
  let component: OpenDrawingComponent;
  let fixture: ComponentFixture<OpenDrawingComponent>;
  let openDrawingServiceSpy: jasmine.SpyObj<OpenDrawingService>;
  const tagControl: FormControl = new FormControl('Test');

  const mockDrawing: Drawing = {
    name: 'mock',
    tags: ['tag1', 'tag2'],
    path: '',
    createdAt: new Date(),
    fileName: 'mockfile.svg',
  };

  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    close: null,
  });
  dialogRefSpyObj.componentInstance = { body: '' };

  beforeEach(async(() => {
    const spyRenderer = jasmine.createSpyObj('Renderer2',
      ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle', 'removeChild']);
    const spyDrawingService = jasmine.createSpyObj('DrawingService', ['newDrawing', 'addDrawingObjectList', 'openDrawing']);
    let spyOpenDrawingService = jasmine.createSpyObj('OpenDrawingService', ['getDrawings', 'selectDrawing', 'getBackgroundSelected',
      'getBackground', 'reset', 'add', 'remove', 'selectTag', 'accept', 'openDrawing', 'tagCtrl', 'filteredTags', 'localDrawingThumbnail',
      'handleFile', 'deleteDrawing', 'getTags']);

    const spyTagService = jasmine.createSpyObj('TagService', ['containsTag']);

    spyOpenDrawingService.getDrawings.and.returnValue(of(new Array(mockDrawing)));
    spyOpenDrawingService = {
      ...spyOpenDrawingService,
      filteredTags: of(['test']),
      tags: [],
      allTags: [],
      tagCtrl: tagControl,

    };
    TestBed.configureTestingModule({
      declarations: [OpenDrawingComponent],
      imports: [MaterialModules, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, HttpClientModule, MomentModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpyObj }, { provide: DrawingService, useValue: spyDrawingService }
        , { provide: TagService, useValue: spyTagService }, { provide: OpenDrawingService, useValue: spyOpenDrawingService },
      { provide: Renderer2, useValue: spyRenderer },
      ],
    });

    spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
    openDrawingServiceSpy = TestBed.get(OpenDrawingService);
    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('#ngOnInit should update filterPredicate with tags and connect DataObs', () => {
    component.ngOnInit();
    expect(component.dataObs).toBe(component.dataSource.connect());
  });
  it('#ngOnDestroy should disconnect dataSource if exists', () => {
    const dataSourceSpy: jasmine.SpyObj<MatTableDataSource<Drawing>> = jasmine.createSpyObj('MatTableDataSource', ['disconnect']);
    component.dataSource = dataSourceSpy;
    component.ngOnDestroy();
    expect(dataSourceSpy.disconnect).toHaveBeenCalled();

  });
  it('#ngOnDestroy should not disconnect dataSource if it does not exist', () => {
    const dataSourceSpy: jasmine.SpyObj<MatTableDataSource<Drawing>> = jasmine.createSpyObj('MatTableDataSource', ['disconnect']);
    component.ngOnDestroy();
    expect(dataSourceSpy.disconnect).not.toHaveBeenCalled();
  });

  it('#tagCtrl should get tagCtrl from openDrawingService', () => {
    const result = component.tagCtrl;
    expect(result).toBe(tagControl);
  });

  it('#filteredTags should return observable of strings array', () => {
    const result = component.filteredTags;
    expect(result).toBe(openDrawingServiceSpy.filteredTags);
  });
  it('#selectedTags should return selected tags from service', () => {
    const result = component.selectedTags;
    expect(result).toBe(openDrawingServiceSpy.selectedTags);
  });

  it('#allTags should return tags from service', () => {
    const result = component.allTags;
    expect(result).toBe(openDrawingServiceSpy.allTags);
  });
  it('#selectedDrawing should return selected drawing', () => {
    const result = component.selectedDrawing;
    expect(result).toBe(openDrawingServiceSpy.selectedDrawing);
  });

  it('#close should close dialog', () => {
    const dialogRef = TestBed.get(MatDialogRef);
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
  it('#getBackgroundSelected should get background selected from openDrawingService', () => {
    openDrawingServiceSpy.getBackgroundSelected.and.returnValue(`grey`);
    const result = component.getBackgroundSelected(mockDrawing);
    expect(result).toEqual(`grey`);
  });

  it('#selectDrawing should call selectDrawing from openDrawingService', () => {
    component.selectDrawing(mockDrawing);
    expect(openDrawingServiceSpy.selectDrawing).toHaveBeenCalled();
  });
  it('#accept should call accept from openDrawingService', () => {
    component.accept();
    expect(openDrawingServiceSpy.accept).toHaveBeenCalled();
  });

  it('#add should call add tag from the service and update the filter', () => {

    const inputEventSpy: jasmine.SpyObj<MatChipInputEvent> = jasmine.createSpyObj('MatChipInputEvent', ['mockTag']);
    openDrawingServiceSpy.selectedTags = ['mockTag'];

    component.add(inputEventSpy);

    expect(openDrawingServiceSpy.add).toHaveBeenCalled();
    expect(component.dataSource.filter).toBe('mockTag');

  });
  it('#add should call remove tag from the service and update the filter', () => {
    openDrawingServiceSpy.selectedTags = ['mockTag'];
    component.remove('tag');

    expect(openDrawingServiceSpy.remove).toHaveBeenCalled();
    expect(component.dataSource.filter).toBe('mockTag');
  });
  it('#selected should select clickedTag, reset tagInput and update datasource.filter', () => {
    const autoCompleteoption: jasmine.SpyObj<MatOption> = jasmine.createSpyObj('MatOption', ['viewValue']);
    const autoCompleteEvent: jasmine.SpyObj<MatAutocompleteSelectedEvent> = jasmine.createSpyObj('MatAutocompleteSelectedEvent',
      ['option']);
    autoCompleteEvent.option = autoCompleteoption;
    component.tagInput.nativeElement.value = 'defaultValue';
    openDrawingServiceSpy.selectedTags = ['mockTag'];

    component.selected(autoCompleteEvent);
    expect(openDrawingServiceSpy.selectTag).toHaveBeenCalled();
    expect(component.tagInput.nativeElement.value).toBe('');
    expect(component.dataSource.filter).toBe('mockTag');

  });
  it('#handleFile should call same function from openDrawing service', () => {
    component.fileUploadEl = { nativeElement: { files: {} } };
    component.handleFile();
    expect(openDrawingServiceSpy.handleFile).toHaveBeenCalled();
  });

  it('#deleteDrawing should call deleteDrawing from openDrawingService with good index', async () => {
    const mouseEvent = new MouseEvent('mousedown');
    openDrawingServiceSpy.deleteDrawing.and.returnValue(new Promise<boolean>((resolve) => { resolve(true); }));
    const data = component.dataSource.data;
    expect(component.drawingPreview).toEqual(component.dataSource.data);
    component.dataSource.data = [mockDrawing];
    await component.deleteDrawing(mouseEvent, mockDrawing);
    expect(component.drawingPreview).not.toEqual(data);
  });

  it('#deleteDrawing should call deleteDrawing from openDrawingService', async () => {
    const mouseEvent = new MouseEvent('mousedown');
    openDrawingServiceSpy.deleteDrawing.and.returnValue(new Promise<boolean>((resolve) => { resolve(true); }));
    expect(component.drawingPreview).toEqual(component.dataSource.data);
    await component.deleteDrawing(mouseEvent, mockDrawing);
    expect(component.drawingPreview).toEqual(component.dataSource.data);
  });

  it('#deleteDrawing should call deleteDrawing from drawing request service', async () => {
    const mouseEvent = new MouseEvent('mousedown');
    openDrawingServiceSpy.deleteDrawing.and.returnValue(new Promise<boolean>((resolve) => { resolve(false); }));
    expect(component.drawingPreview).toEqual(component.dataSource.data);
    await component.deleteDrawing(mouseEvent, mockDrawing);
    expect(component.drawingPreview).toEqual(component.dataSource.data);
  });

  it('#getLocalThumbnail should set svgThumbnail if it exists', () => {

    const HTMLElements: any = {};
    const parent = document.createElement('div');

    const newElement = document.createElement('div');
    parent.appendChild(newElement);
    const svgChildren = document.createElement('div');
    const spy = spyOn(document, 'getElementById').and.callFake((ID) => {
      if (!HTMLElements[ID]) {

        newElement.appendChild(svgChildren);
        HTMLElements[ID] = newElement;
      }
      return HTMLElements[ID];

    });
    openDrawingServiceSpy.localDrawingThumbnail = 'hello';
    component.getLocalThumbnail();
    expect(svgChildren.innerHTML).toBe(openDrawingServiceSpy.localDrawingThumbnail);
    spy.calls.reset();

  });
  it('#getLocalThumbnail should  not set svgThumbnail if it does not exists', () => {

    const HTMLElements: any = {};
    const parent = document.createElement('div');

    const newElement = document.createElement('div');
    parent.appendChild(newElement);
    const svgChildren = document.createElement('div');
    const spy = spyOn(document, 'getElementById').and.callFake((ID) => {
      if (!HTMLElements[ID]) {

        HTMLElements[ID] = newElement;
      }
      return HTMLElements[ID];
    });
    openDrawingServiceSpy.localDrawingThumbnail = 'hello';

    component.getLocalThumbnail();
    expect(svgChildren.innerHTML).not.toBe(openDrawingServiceSpy.localDrawingThumbnail);
    spy.calls.reset();

  });
  it('#getLocalThumbnail should  not set svgThumbnail if container does not exists', () => {

    const svgChildren = document.createElement('div');

    const spy = spyOn(document, 'getElementById').and.callFake(() => {
      return null;
    });
    openDrawingServiceSpy.localDrawingThumbnail = 'hello';

    component.getLocalThumbnail();
    expect(svgChildren.innerHTML).not.toBe(openDrawingServiceSpy.localDrawingThumbnail);
    spy.calls.reset();
  });

  it('#isOneWeekOld should retrun true', () => {
    const result = component.isOneWeekOld(0);
    expect(result).toEqual(true);
  });

});
