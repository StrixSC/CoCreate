import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { Drawing } from '../../../../../common/communication/drawing';
import { DrawingRequestService } from '../drawing-request/drawing-request.service';
import { DrawingService } from '../drawing/drawing.service';
import { GetDrawingRequestService } from '../get-drawing-request/get-drawing-request.service';
import { OpenLocalService } from '../open-local/open-local-file.service';
import { TagService } from '../tag/tag.service';
import { OpenDrawingService } from './open-drawing.service';

describe('OpenDrawingService', () => {
  let service: OpenDrawingService;
  let openDrawingLocalServiceSpy: jasmine.SpyObj<OpenLocalService>;
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
  let getDrawingRequestServiceSpy: jasmine.SpyObj<GetDrawingRequestService>;
  let drawingRequestServiceSpy: jasmine.SpyObj<DrawingRequestService>;

  let dialogSpy: jasmine.Spy;

  const dialogRefSpyObj = jasmine.createSpyObj({
    afterClosed: of({}),
    afterOpened: of({}),
    close: null,
  });
  const mockDrawing: Drawing = {
    name: 'mock',
    tags: ['tag1', 'tag2'],
    path: '',
    createdAt: new Date(),
    fileName: 'mockfile.svg',
  };
  beforeEach(() => {
    const spyOpenLocalService = jasmine.createSpyObj('OpenLocalService', ['handleFile']);
    const spyDrawingService = jasmine.createSpyObj('DrawingService', ['newDrawing', 'addDrawingObjectList', 'openDrawing']);
    const spyTagService = jasmine.createSpyObj('TagService', ['containsTag', 'retrieveTags']);
    const spyGetDrawingRequest = jasmine.createSpyObj('GetDrawingRequestService', ['getDrawings']);
    const spyDrawingRequest = jasmine.createSpyObj('DrawingRequestService', ['openDrawing', 'deleteDrawing']);
    const spyFileReader = jasmine.createSpyObj('FileReader', ['readAsText', 'onload', 'onerror']);

    spyTagService.retrieveTags.and.returnValue(of(['tag1', 'tag2']));
    TestBed.configureTestingModule(
      {
        imports: [MaterialModules, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, HttpClientModule],
        providers: [OpenDrawingService, { provide: OpenLocalService, useValue: spyOpenLocalService },
          { provide: DrawingService, useValue: spyDrawingService },
          { provide: TagService, useValue: spyTagService }, { provide: GetDrawingRequestService, useValue: spyGetDrawingRequest },
          { provide: DrawingRequestService, useValue: spyDrawingRequest },
          { provide: MatDialogRef, useValue: dialogRefSpyObj }, { provide: FileReader, useValue: spyFileReader }],
      });
    TestBed.compileComponents();
    service = TestBed.get(OpenDrawingService);
    drawingServiceSpy = TestBed.get(DrawingService);
    openDrawingLocalServiceSpy = TestBed.get(OpenLocalService);

    getDrawingRequestServiceSpy = TestBed.get(GetDrawingRequestService);
    drawingRequestServiceSpy = TestBed.get(DrawingRequestService);
    dialogSpy = spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should get drawing previews', () => {
    getDrawingRequestServiceSpy.getDrawings.and.returnValue(of([mockDrawing]));

    service.getDrawings().subscribe((drawingList: Drawing[]) => {
      expect(getDrawingRequestServiceSpy.getDrawings).toHaveBeenCalled();
      expect(drawingList).toEqual([mockDrawing]);
    });
  });

  it('should return grey background color for selected', () => {
    service.selectedDrawing = mockDrawing;
    const result = service.getBackgroundSelected(mockDrawing);
    expect(result).toEqual('grey');

  });
  it('should return white background color for not selected', () => {
    service.selectedDrawing = null;

    const result = service.getBackgroundSelected(mockDrawing);
    expect(result).toEqual(`white`);

  });

  it('should return selectedDrawing when selectdrawing is called', () => {
    service.selectDrawing(mockDrawing);
    expect(service.selectedDrawing).toEqual(mockDrawing);
  });

  it('#reset should reset the values for the save drawing service', () => {
    service.reset();
    expect(service.tagCtrl.untouched).toBeTruthy();
    expect(service.selectedTags.length).toEqual(0);
  });

  it('#add should add a tag in the list of selected tags', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, true);
    expect(service.tagCtrl.value).toBeNull();
    expect(service.selectedTags.includes(value.trim())).toBeTruthy();
    expect(input.value).toEqual('');
  });

  it('#add should do nothing if isMatAutoComplete false ', () => {
    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, false);
    expect().nothing();
  });

  it('#add should not a tag if already present', () => {
    service.selectedTags = ['test'];

    const intialLength: number = service.selectedTags.length;

    const input: HTMLInputElement = document.createElement('input');
    input.value = 'VALUE';
    const value = 'test';
    service.tagCtrl.setValue('val');
    service.add({ input, value }, true);
    expect(service.selectedTags.length).toEqual(intialLength);

  });

  it('#filter should return the tags filtered to match string', () => {
    expect(service.filter('Tag1')).toEqual(['tag1']);
  });
  it('should change the filtered tags', () => {
    service.filteredTags.subscribe((value) => {
      expect(value).toBeTruthy();
    });
    service.tagCtrl.patchValue('tag1');
  });
  it('#selected should push the tag value', () => {
    service.selectTag('Tag8');
    expect(service.selectedTags.includes('Tag8')).toBeTruthy();
    expect(service.tagCtrl.value).toBeNull();
  });
  it('#accept should not open drawing if no drawing selected', () => {
    service.selectedDrawing = null;
    const dialogRef = TestBed.get(MatDialogRef);
    expect(service.accept(dialogRef, 4)).not.toBeDefined();
  });

  it('#accept should open drawing local if drawing created is false but do nothing if selected drawing is null', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service, 'openDrawingLocal');
    drawingServiceSpy.isCreated = false;
    service.accept(dialogRef, 1);
    expect(spy).toHaveBeenCalled();
    service.selectedDrawing = null;
    expect(service.openDrawingLocal(dialogRef)).toBeUndefined();
  });

  it('#accept should open drawing local if drawing created is false and selected drawing is not null', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service as any, 'openDrawing');
    drawingServiceSpy.isCreated = false;
    service.accept(dialogRef, 1);
    expect(spy).toHaveBeenCalledWith(dialogRef, service.selectedDrawing.path);
  });

  it('#accept should open drawing Online if drawing created is false but do nothing if selected drawing is null', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service, 'openDrawingOnline');
    drawingServiceSpy.isCreated = false;
    service.accept(dialogRef, 3);
    expect(spy).toHaveBeenCalled();
    service.selectedDrawing = null;
    expect(service.openDrawingOnline(dialogRef)).toBeUndefined();
  });

  it('#accept should open drawing Online if drawing created is false and if selected drawing is not null', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service, 'openDrawingOnline');
    drawingServiceSpy.isCreated = false;
    service.accept(dialogRef, 3);
    expect(spy).toHaveBeenCalled();
  });

  it('#openOnline should open drawing from drawing request service', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service as any, 'openDrawing');
    const drawingString = 'hello';
    drawingRequestServiceSpy.openDrawing.and.returnValue(of(drawingString));
    service.openDrawingOnline(dialogRef);
    expect(spy).toHaveBeenCalled();
  });

  it('#openOnline should not open drawing from drawing request service if selected drawing does not exist', () => {
    service.selectedDrawing = null;
    const dialogRef = TestBed.get(MatDialogRef);
    service.openDrawingOnline(dialogRef);
    expect().nothing();
  });

  it('#openLocal should open drawing ', () => {
    service.selectedDrawing = mockDrawing;
    const dialogRef = TestBed.get(MatDialogRef);
    service.openDrawingLocal(dialogRef);
    expect(drawingServiceSpy.openDrawing).toHaveBeenCalled();
  });

  it('#openOnline should not open drawing if selected drawing does not exist', () => {
    service.selectedDrawing = null;
    const dialogRef = TestBed.get(MatDialogRef);
    service.openDrawingLocal(dialogRef);
    expect().nothing();
  });

  it('#accept should call open Local if drawing created is true and result of afterClosed is true', () => {
    service.selectedDrawing = mockDrawing;
    drawingServiceSpy.isCreated = true;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service, 'openDrawingLocal');
    dialogRefSpyObj.afterClosed({ result: true });
    service.accept(dialogRef, 1);
    expect(dialogSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('#accept should call open Online if drawing created is true and result of afterClosed is true', () => {
    service.selectedDrawing = mockDrawing;
    drawingServiceSpy.isCreated = true;
    const dialogRef = TestBed.get(MatDialogRef);
    const spy = spyOn(service, 'openDrawingOnline');
    dialogRefSpyObj.afterClosed({ result: true });
    service.accept(dialogRef, 2);
    expect(spy).toHaveBeenCalled();
  });

  it('#accept should do nothing if drawing created is true and result of afterClosed is false', () => {
    service.selectedDrawing = mockDrawing;
    drawingServiceSpy.isCreated = true;
    const dialogRef = TestBed.get(MatDialogRef);
    dialogRefSpyObj.afterClosed({ result: false });
    service.accept(dialogRef, 1);
    expect().nothing();
  });

  it('#remove should remove the tag if it exist', () => {
    service.selectedTags = ['tag1', 'tag2'];
    service.remove('tag2');
    expect(service.selectedTags).toEqual(['tag1']);
  });

  it('#remove should not remove the tag if it doesnt exist', () => {
    service.selectedTags = ['tag1', 'tag2'];
    service.remove('tag3');
    expect(service.selectedTags).toEqual(['tag1', 'tag2']);
  });

  it('#handleFile should handle file with attributes', () => {
    const blob = new Blob([''], { type: 'text/html' });

    const file = blob as File;
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    };
    const spy = spyOn(service, 'selectDrawing');
    const documentString = `<svg xmlns="http://www.w3.org/2000/svg"
    _ngcontent-sbj-c13="" width="1029" height="580" style="background-color:rgba(255,255,255,1)"
    id="undefined" sourceKey="PolyDessin-E16" name="default" backGroundColor="#ffffff" alpha="1"></svg>`;
    openDrawingLocalServiceSpy.handleFile.and.returnValue(of(documentString));
    service.handleFile(fileList);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleFile should handle file with children', () => {
    const blob = new Blob([''], { type: 'text/html' });

    const file = blob as File;
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    };
    const spy = spyOn(service, 'selectDrawing');
    const documentString = `<svg xmlns="http://www.w3.org/2000/svg"
    _ngcontent-sbj-c13="" width="1029" height="580" style="background-color:rgba(255,255,255,1)"
    sourceKey="PolyDessin-E16"  backGroundColor="#ffffff" alpha="1"><rect></rect></svg>`;
    openDrawingLocalServiceSpy.handleFile.and.returnValue(of(documentString));
    service.handleFile(fileList);

    expect(spy).toHaveBeenCalled();
  });

  it('#handleFile should handle file without attributes', () => {
    const blob = new Blob([''], { type: 'text/html' });

    const file = blob as File;
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    };
    const spy = spyOn(service, 'selectDrawing');
    const documentString = `<svg xmlns="http://www.w3.org/2000/svg"
    _ngcontent-sbj-c13="" id="undefined" sourceKey="PolyDessin-E16" name="default" ></svg>`;
    openDrawingLocalServiceSpy.handleFile.and.returnValue(of(documentString));
    service.handleFile(fileList);

    expect(spy).toHaveBeenCalled();
  });

  it('#handleFile should call errorHandling since source key is wrong', () => {
    const blob = new Blob([''], { type: 'text/html' });

    const file = blob as File;
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file,
    };
    const spy = spyOn(service, 'errorHandling');
    const documentString = `<svg xmlns="http://www.w3.org/2000/svg"
    _ngcontent-sbj-c13="" width="1029" height="580" style="background-color:rgba(255,255,255,1)"
    id="undefined" sourceKey="PolyDessin-E10" name="default" backGroundColor="#ffffff" alpha="1"></svg>`;
    openDrawingLocalServiceSpy.handleFile.and.returnValue(of(documentString));
    service.handleFile(fileList);

    expect(spy).toHaveBeenCalled();
  });

  it('#deleteDrawing should show a dialog of confirmation before requesting delete', async () => {
    drawingRequestServiceSpy.deleteDrawing.and.returnValue(of({ success: true }));
    await service.deleteDrawing(mockDrawing);
    expect(drawingRequestServiceSpy.deleteDrawing).toHaveBeenCalled();
  });

  it('#deleteDrawing should show a dialog of confirmation before requesting delete and not delete', async () => {
    dialogRefSpyObj.afterClosed = () => of(false);
    drawingRequestServiceSpy.deleteDrawing.and.returnValue(of({ success: true }));
    await service.deleteDrawing(mockDrawing);
    expect(drawingRequestServiceSpy.deleteDrawing).not.toHaveBeenCalled();
    dialogRefSpyObj.afterClosed = () => of({});
  });

  it('#errorHandling should set errorDialog to error message', () => {
    service.errorHandling();

    expect(service.errorDialog).toEqual(`Erreur. Le fichier choisi ne peut pas être ouvert, ouvrir un autre fichier.
      Seulement les fichiers SVG créés par Polydessin peuvent être ouvert`);
  });
});
