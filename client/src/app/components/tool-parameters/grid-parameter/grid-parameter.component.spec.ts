import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleChange, MatButtonToggleModule, MatCheckboxChange } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { GridService } from 'src/app/services/tools/grid-tool/grid.service';
import { GridParameterComponent } from './grid-parameter.component';

describe('GridParameterComponent', () => {
  let component: GridParameterComponent;
  let fixture: ComponentFixture<GridParameterComponent>;
  let gridService: { parameters: FormGroup };

  beforeEach(async(() => {
    const mockGridService = {
      parameters: new FormGroup({
        sizeCell: new FormControl(100),
        transparence: new FormControl(1),
        activateGrid: new FormControl(false),
        activateMagnetism: new FormControl(false),
        anchorPointMagnetism: new FormControl(1),
        color: new FormControl('black'),
      }),
    };

    TestBed.configureTestingModule({
      declarations: [GridParameterComponent],
      imports: [ReactiveFormsModule,
        MatButtonToggleModule, BrowserAnimationsModule, MaterialModules],
      providers: [{ provide: GridService, useValue: mockGridService }],
    })
      .compileComponents();
    gridService = TestBed.get(GridService);

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the cellSize value', () => {
    const form = gridService.parameters.get('sizeCell') as FormControl;
    form.patchValue(6);
    expect(component.cellSizeValue).toEqual(6);
  });

  it('should return the anchorPointMagnetism value', () => {
    const form = gridService.parameters.get('anchorPointMagnetism') as FormControl;
    form.patchValue(3);
    expect(component.anchorValue).toEqual(3);
  });

  it('should return the transparence', () => {
    const form = gridService.parameters.get('transparence') as FormControl;
    form.patchValue(0.5);
    expect(component.opacityValue).toEqual(0.5);
  });

  it('should return the activateGrid form', () => {
    const form = gridService.parameters.get('activateGrid') as FormControl;
    form.patchValue(false);
    expect(component.activateGrid.value).toEqual(false);
  });

  it('should return the activateMagnetism form', () => {
    const form = gridService.parameters.get('activateMagnetism') as FormControl;
    form.patchValue(false);
    expect(component.activateMagnetism.value).toEqual(false);
  });

  it('should change grid form to true', () => {
    component.onSelection({ checked: true } as MatCheckboxChange);
    expect(component.activateGrid.value).toEqual(true);
  });

  it('should change magnetism form to true', () => {
    component.onMagnetismSelection({ checked: true } as MatCheckboxChange);
    expect(component.activateMagnetism.value).toEqual(true);
  });

  it('should change grid form to false', () => {
    component.onSelection({ checked: true } as MatCheckboxChange);
    component.onSelection({ checked: false } as MatCheckboxChange);
    expect(component.activateGrid.value).toEqual(false);
  });

  it('should change magnetism form to false', () => {
    component.onMagnetismSelection({ checked: true } as MatCheckboxChange);
    component.onMagnetismSelection({ checked: false } as MatCheckboxChange);
    expect(component.activateMagnetism.value).toEqual(false);
  });

  it('should return the activateGrid form', async () => {
    const form = gridService.parameters.get('activateGrid') as FormControl;
    form.patchValue(false);
    expect(component.activateGrid.value).toEqual(false);
    expect(component.matCheckbox.checked).toEqual(false);
  });

  it('should patch color value in form', () => {
    const form = gridService.parameters.get('color') as FormControl;
    component.changeColor({ value: 1 } as MatButtonToggleChange);
    expect(form.value).toEqual('white');
  });

  it('should patch anchor value in form', () => {
    const form = gridService.parameters.get('anchorPointMagnetism') as FormControl;
    component.changeAnchor({ value: 1 } as MatButtonToggleChange);
    expect(form.value).toEqual(1);
  });
});
