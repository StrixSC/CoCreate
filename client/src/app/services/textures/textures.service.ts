import { Injectable, Renderer2 } from '@angular/core';
import { RGBA } from 'src/app/model/rgba.model';
import { TextureOptions } from '../../model/texture-options.model';
import { Texture } from '../../interfaces/texture.interface';
import { TEXTURE_FIVE, TEXTURE_FOUR, TEXTURE_ONE, TEXTURE_THREE, TEXTURE_TWO } from '../../classes/textures/texture-id';
import { TextureOne } from '../../classes/textures/texture1';
import { TextureTwo } from '../../classes/textures/texture2';
import { TextureThree } from '../../classes/textures/texture3';
import { TextureFour } from '../../classes/textures/texture4';
import { TextureFive } from '../../classes/textures/texture5';

/// Classe service qui permet de retourner une texture selon un indexe
@Injectable({
  providedIn: 'root',
})
export class TexturesService {
  textureOptionList: TextureOptions[] = [
    { value: TEXTURE_ONE, viewValue: 'Texture 1' },
    { value: TEXTURE_TWO, viewValue: 'Texture 2' },
    { value: TEXTURE_THREE, viewValue: 'Texture 3' },
    { value: TEXTURE_FOUR, viewValue: 'Texture 4' },
    { value: TEXTURE_FIVE, viewValue: 'Texture 5' },
  ];
  textureList: Map<number, Texture> = new Map<number, Texture>();
  private lastId = 0;

  constructor() {
    this.initTexureMap();
  }

  /// Initialise la liste de tous les textures par défault
  private initTexureMap(): void {
    let texture: Texture;
    texture = new TextureOne();
    this.textureList.set(texture.id, texture);
    texture = new TextureTwo();
    this.textureList.set(texture.id, texture);
    texture = new TextureThree();
    this.textureList.set(texture.id, texture);
    texture = new TextureFour();
    this.textureList.set(texture.id, texture);
    texture = new TextureFive();
    this.textureList.set(texture.id, texture);
  }

  /// Retourne la première texture
  get firstTexture(): TextureOptions {
    return this.textureOptionList[0];
  }

  getTextureElement(textureNumber: number, primaryColor: RGBA, x: number, y: number, renderer: Renderer2): SVGDefsElement | null {
    const texture: Texture | null = this.returnTexture(textureNumber);
    return texture ? texture.getPattern(primaryColor, 'texture-' + (this.lastId++), x, y, renderer) : null;
  }

  /// Retourne la texture de l'index voulue
  returnTexture(textureNumber: number): Texture | null {
    if (textureNumber < 0) {
      return null;
    }
    const texture: Texture | undefined = this.textureList.get(textureNumber);
    return texture ? texture : new TextureOne();
  }
}
