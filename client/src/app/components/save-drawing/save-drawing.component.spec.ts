import { HttpClientModule } from '@angular/common/http';
import { Renderer2 } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatDialog, MatDialogRef, MatOption } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MaterialModules } from 'src/app/app-material.module';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SaveDrawingService } from 'src/app/services/save-drawing/save-drawing.service';
import { option, SaveDrawingComponent } from './save-drawing.component';

describe('SaveDrawingComponent', () => {
    let component: SaveDrawingComponent;
    let fixture: ComponentFixture<SaveDrawingComponent>;
    let spyDrawingService: jasmine.SpyObj<DrawingService>;
    let spySaveDrawingService: jasmine.SpyObj<SaveDrawingService>;

    const dialogRefSpyObj = jasmine.createSpyObj({
        afterClosed: of({}),
        afterOpened: of({}),
        close: null,
    });
    const mattabSpyObj = jasmine.createSpyObj('Mattab', ['index']);
    dialogRefSpyObj.componentInstance = { body: '' };
    const tagControl: FormControl = new FormControl('Test');
    let saveDrawingServiceSpy = jasmine.createSpyObj('SaveDrawingService',
        ['add', 'remove', 'open', 'selected', 'save', 'reset', 'saveLocally']);
    saveDrawingServiceSpy = {
        ...saveDrawingServiceSpy,
        nameCtrl: new FormControl('Name'),
        tags: [],
        tagCtrl: tagControl,
        filteredTags: of(['test']),
        saveEnabled: true,
    };
    let drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['drawString']);
    drawingServiceSpy = {
        ...drawingServiceSpy,
        width: 300,
        height: 300,
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SaveDrawingComponent],
            imports: [MaterialModules, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, HttpClientModule],
            providers: [Renderer2,
                { provide: SaveDrawingService, useValue: saveDrawingServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpyObj }],
        });
        spyOn(TestBed.get(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        TestBed.compileComponents();
        spyDrawingService = TestBed.get(DrawingService);
        spySaveDrawingService = TestBed.get(SaveDrawingService);
    }));

    beforeEach(() => {
        spyDrawingService.drawing = document.createElementNS('svg', 'svg') as SVGElement;
        fixture = TestBed.createComponent(SaveDrawingComponent);
        component = fixture.componentInstance;
        component.svg = { nativeElement: { innerHTML: '' } };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#add should call the saveDrawingService #add', () => {
        component.add({ input: document.createElement('input'), value: '' });
        expect(spySaveDrawingService.add).toHaveBeenCalled();
    });
    it('#tabChanged should set the selectedOption', () => {

        mattabSpyObj.index = 1;
        component.tabChanged(mattabSpyObj);
        expect(component.selectedOption === option.saveLocal).toBeTruthy();
    });

    it('#remove should call the saveDrawingService #remove', () => {
        component.remove('');
        expect(spySaveDrawingService.remove).toHaveBeenCalled();
    });

    it('#selected should call the saveDrawingService #selected', () => {
        component.selected({ source: {} as MatAutocomplete, option: {} as MatOption });
        expect(spySaveDrawingService.selected).toHaveBeenCalled();
        expect(component.tagInput.nativeElement.value).toEqual('');
    });

    it('#save should call save and close if success', async () => {
        const spy = spyOn(component, 'close');
        spySaveDrawingService.save.and.returnValue(new Promise((resolve) => resolve(true)));
        await component.save();
        expect(spySaveDrawingService.save).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('#save should call save and not close if fail', async () => {
        const spy = spyOn(component, 'close');
        spySaveDrawingService.save.and.returnValue(new Promise((resolve) => resolve(false)));
        await component.save();
        expect(spySaveDrawingService.save).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });
    it('#save should call saveLocally and  close if success', async () => {
        const spy = spyOn(component, 'close');
        spySaveDrawingService.saveLocally.and.returnValue(new Promise((resolve) => resolve(true)));
        component.selectedOption = option.saveLocal;
        await component.save();
        expect(spySaveDrawingService.saveLocally).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });
    it('#save should call saveLocally and not close if fail', async () => {
        const spy = spyOn(component, 'close');
        spySaveDrawingService.saveLocally.and.returnValue(new Promise((resolve) => resolve(false)));
        component.selectedOption = option.saveLocal;
        await component.save();
        expect(spySaveDrawingService.saveLocally).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('#close should close dialog', () => {
        const dialogRef = TestBed.get(MatDialogRef);
        component.close();
        expect(dialogRef.close).toHaveBeenCalled();
    });
    it('#return false if selected option is not saveServer', () => {
        component.selectedOption = option.saveLocal;
        const result: boolean = component.isSaveButtonEnabled;
        expect(result).toEqual(false);
    });
});
