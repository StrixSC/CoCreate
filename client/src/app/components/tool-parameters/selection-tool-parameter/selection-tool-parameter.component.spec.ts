import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyPasteToolService } from 'src/app/services/tools/copy-paste-tool/copy-paste-tool.service';
import { DeletingToolService } from 'src/app/services/tools/selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { SelectionToolParameterComponent } from './selection-tool-parameter.component';

describe('SelectionToolParameterComponent', () => {
  let component: SelectionToolParameterComponent;
  let fixture: ComponentFixture<SelectionToolParameterComponent>;

  let selectionServiceSpy: jasmine.SpyObj<SelectionToolService>;
  let copyPasteServiceSpy: jasmine.SpyObj<CopyPasteToolService>;
  let deletingServiceSpy: jasmine.SpyObj<DeletingToolService>;

  beforeEach(async(() => {
    const spyCopyPaste = jasmine.createSpyObj('CopyPasteToolService', ['copy', 'cut', 'paste', 'duplicate', 'hasClipboardObject']);
    const spyDeleting = jasmine.createSpyObj('DeletingToolService', ['deleteSelection']);
    let spySelection = jasmine.createSpyObj('SelectionToolService', ['selectAll', 'hasSelection']);
    spySelection = {
      ...spySelection,
      toolName: 'selection',
    };

    TestBed.configureTestingModule({
      declarations: [SelectionToolParameterComponent],
      providers: [
        { provide: SelectionToolService, useValue: spySelection },
        { provide: CopyPasteToolService, useValue: spyCopyPaste },
        { provide: DeletingToolService, useValue: spyDeleting },
      ],
    })
      .compileComponents();

    selectionServiceSpy = TestBed.get(SelectionToolService);
    copyPasteServiceSpy = TestBed.get(CopyPasteToolService);
    deletingServiceSpy = TestBed.get(DeletingToolService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#copy should call copy of CopyPasteToolService', () => {
    component.copy();
    expect(copyPasteServiceSpy.copy).toHaveBeenCalled();
  });

  it('#cut should call cut of CopyPasteToolService', () => {
    component.cut();
    expect(copyPasteServiceSpy.cut).toHaveBeenCalled();
  });

  it('#paste should call paste of CopyPasteToolService', () => {
    component.paste();
    expect(copyPasteServiceSpy.paste).toHaveBeenCalled();
  });

  it('#duplicate should call duplicate of CopyPasteToolService', () => {
    component.duplicate();
    expect(copyPasteServiceSpy.duplicate).toHaveBeenCalled();
  });

  it('#hasClipboardObject should call hasClipboardObject of CopyPasteToolService', () => {
    copyPasteServiceSpy.hasClipboardObject.and.returnValue(true);
    let tmp = false;
    tmp = component.hasClipboardObject;
    expect(tmp).toBeTruthy();
  });

  it('#deleteSelection should call deleteSelection of SelectionToolService', () => {
    component.deleteSelection();
    expect(deletingServiceSpy.deleteSelection).toHaveBeenCalled();
  });

  it('#selectAll should call selectAll of SelectionToolService', () => {
    component.selectAll();
    expect(selectionServiceSpy.selectAll).toHaveBeenCalled();
  });

  it('#hasSelection should call hasSelection of SelectionToolService', () => {
    selectionServiceSpy.hasSelection.and.returnValue(true);
    let tmp = false;
    tmp = component.hasSelection;
    expect(tmp).toBeTruthy();
  });

  it('#toolName should call toolName of SelectionToolService', () => {
    expect(component.toolName).toEqual('selection');
  });
});
