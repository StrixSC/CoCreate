import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TEXTURE_FIVE, TEXTURE_FOUR, TEXTURE_ONE, TEXTURE_THREE, TEXTURE_TWO } from 'src/app/classes/textures/texture-id';
import { TextureOptions } from 'src/app/model/texture-options.model';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { TexturesService } from 'src/app/services/textures/textures.service';
import { BrushToolService } from 'src/app/services/tools/brush-tool/brush-tool.service';

/// Le component d'affichage des paramètres du pinceau
@Component({
  selector: 'app-brush-tool-parameter',
  templateUrl: './brush-tool-parameter.component.html',
  styleUrls: ['./brush-tool-parameter.component.scss'],
})
export class BrushToolParameterComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  textureList: SVGDefsElement[];
  @ViewChild('textureSvg', { static: false }) textureSvg: ElementRef<SVGElement>;

  constructor(
    private brushToolService: BrushToolService,
    private textureService: TexturesService,
    private rendererProviderService: RendererProviderService,
  ) {
    this.textureList = [
      this.textureService.getTextureElement(
        TEXTURE_ONE, { rgb: { r: 0, g: 0, b: 0 }, a: 1 }, 0, 0, this.rendererProviderService.renderer) as SVGDefsElement,
      this.textureService.getTextureElement(
        TEXTURE_TWO, { rgb: { r: 0, g: 0, b: 0 }, a: 1 }, 0, 0, this.rendererProviderService.renderer) as SVGDefsElement,
      this.textureService.getTextureElement(
        TEXTURE_THREE, { rgb: { r: 0, g: 0, b: 0 }, a: 1 }, 0, 0, this.rendererProviderService.renderer) as SVGDefsElement,
      this.textureService.getTextureElement(
        TEXTURE_FOUR, { rgb: { r: 0, g: 0, b: 0 }, a: 1 }, 0, 0, this.rendererProviderService.renderer) as SVGDefsElement,
      this.textureService.getTextureElement(
        TEXTURE_FIVE, { rgb: { r: 0, g: 0, b: 0 }, a: 1 }, 0, 0, this.rendererProviderService.renderer) as SVGDefsElement,
    ];
  }

  ngOnInit(): void {
    this.form = this.brushToolService.parameters;
  }

  ngAfterViewInit(): void {
    for (const texture of this.textureList) {
      this.rendererProviderService.renderer.appendChild(this.textureSvg.nativeElement, texture);
    }
  }

  get toolName(): string {
    return this.brushToolService.toolName;
  }

  get listTexture(): TextureOptions[] {
    return this.textureService.textureOptionList;
  }

  get selectedTexture() {
    return this.brushToolService.texture.value;
  }

  get selectedTextureId() {
    return 'url(#' + (this.textureList[this.selectedTexture].firstChild as any).id + ')';
  }

  get strokeWidthValue() {
    return (this.form.get('strokeWidth') as FormControl).value;
  }

}
