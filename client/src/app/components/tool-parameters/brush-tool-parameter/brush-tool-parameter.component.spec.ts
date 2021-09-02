import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModules } from 'src/app/app-material.module';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { TexturesService } from 'src/app/services/textures/textures.service';
import { BrushToolService } from 'src/app/services/tools/brush-tool/brush-tool.service';
import { BrushToolParameterComponent } from './brush-tool-parameter.component';

describe('BrushToolParameterComponent', () => {
  let component: BrushToolParameterComponent;
  let fixture: ComponentFixture<BrushToolParameterComponent>;
  let brushToolService: BrushToolService;
  let texturesService: TexturesService;
  let rendererProvider: RendererProviderService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrushToolParameterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [ReactiveFormsModule, BrowserAnimationsModule,
        MaterialModules],
    })
      .compileComponents();
    brushToolService = TestBed.get(BrushToolService);
    texturesService = TestBed.get(TexturesService);
    rendererProvider = TestBed.get(RendererProviderService);
    const svg = rendererProvider.renderer.createElement('defs', 'svg');
    rendererProvider.renderer.appendChild(svg, rendererProvider.renderer.createElement('pattern', 'svg'));
    spyOn(texturesService, 'getTextureElement').and.returnValue(svg);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushToolParameterComponent);
    component = fixture.componentInstance;
    component.textureSvg = { nativeElement: rendererProvider.renderer.createElement('svg', 'svg') };

    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the tool name', () => {
    expect(component.toolName).toEqual(brushToolService.toolName);
  });

  it('should return the list of texture', () => {
    expect(component.listTexture).toEqual(texturesService.textureOptionList);
  });

  it('should return the selected texture', () => {
    expect(component.selectedTexture).toEqual(brushToolService.texture.value);
  });

  it('should return the stroke width value', () => {
    const form = brushToolService.parameters.get('strokeWidth') as FormControl;
    form.patchValue(6);
    expect(component.strokeWidthValue).toEqual(6);
  });
});
