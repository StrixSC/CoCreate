import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { TextToolService } from '../../../services/tools/text-tool/text-tool.service';
import { TextToolParameterComponent } from './text-tool-parameter.component';

describe('TextToolParameterComponent', () => {
  let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

  let component: TextToolParameterComponent;
  let fixture: ComponentFixture<TextToolParameterComponent>;
  let textToolServiceSpy: jasmine.SpyObj<TextToolService>;
  const rendererSpy = jasmine.createSpyObj('Renderer2', ['createElement', 'setProperty', 'setAttribute', 'appendChild', 'setStyle']);
  beforeEach(async(() => {
    const fontSize = new FormControl(5);
    const textAlignment = new FormControl('start');
    const textStyle = new FormControl('normal');
    const fontFamily = new FormControl('Arial');
    const parameters = new FormGroup({
      fontSize,
      textAlignment,
      textStyle,
      fontFamily,
    });
    const spyTextToolService = { toolName: 'Tool', parameters };

    TestBed.configureTestingModule({

      declarations: [TextToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
      providers: [RendererProviderService,
        { provide: TextToolService, useValue: spyTextToolService },
      ],
    })
      .compileComponents();
    drawingServiceSpy = TestBed.get(DrawingService);
    textToolServiceSpy = TestBed.get(TextToolService);
  }));

  beforeEach(() => {
    drawingServiceSpy.renderer = rendererSpy;
    fixture = TestBed.createComponent(TextToolParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create component', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should return the tool name', async(() => {
    expect(component.toolName).toEqual(textToolServiceSpy.toolName);
  }));

  it('should return the police size value', async(() => {
    const formPoliceSize = textToolServiceSpy.parameters.get('fontSize') as FormControl;
    formPoliceSize.patchValue(6);
    expect(component.policeSize).toEqual(6);
  }));

  it('should call police with value aria ', () => {
    const formPolice = textToolServiceSpy.parameters.get('fontFamily') as FormControl;
    formPolice.patchValue('Arial');
    component.form = new FormGroup({ fontFamily: new FormControl('Arial') });
    const spy = spyOn(component.form, 'patchValue');
    component.selectPolice(1);
    expect(component.police).toEqual('Arial');
    expect(spy).toHaveBeenCalled();
  });

  it('should call selectAlignment', () => {
    component.form = new FormGroup({ textAlignment: new FormControl('') });
    const spy = spyOn(component.form, 'patchValue').and.callThrough();
    component.currentAlignment = 0;
    component.selectAlignment(1);
    expect(spy).toHaveBeenCalled();
    expect(component.textAlignment).toEqual('middle');
  });

  it('should call selectStyle', () => {
    component.form = new FormGroup({ textStyle: new FormControl('') });
    const spy = spyOn(component.form, 'patchValue').and.callThrough();
    component.currentStyle = 0;
    component.selectStyle(0);
    expect(spy).toHaveBeenCalled();
    expect(component.textStyle).toEqual('normal');
  });

});
