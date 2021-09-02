import { TestBed } from '@angular/core/testing';
import { Texture } from 'src/app/interfaces/texture.interface';
import { TEXTURE_ONE, TEXTURE_TWO } from 'src/app/classes/textures/texture-id';
import { TexturesService } from './textures.service';

describe('TexturesService', () => {
  let service: TexturesService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(TexturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.textureList.size).toBeGreaterThan(0);
  });

  it('should return texture one if outside the size of the list', () => {
    const outsideOfListIndex = service.textureList.size + 1;
    const texture: Texture | null = service.returnTexture(outsideOfListIndex);
    if (texture) { expect(texture.id).toBe(TEXTURE_ONE); } else { fail(); }
  });

  it('should return texture of the index if outside the size of the list', () => {
    const texture: Texture | null = service.returnTexture(TEXTURE_TWO);
    if (texture) { expect(texture.id).toBe(TEXTURE_TWO); } else { fail(); }

  });

  it('should return texture one as the first texture option', () => {
    expect(service.firstTexture.value).toBe(TEXTURE_ONE);
  });

  it('should return null if the texture number is below 0', () => {
    expect(service.returnTexture(-1)).toBeNull();
  });

  it('should get texture element', () => {
    const renderer2Spy = jasmine.createSpyObj('Renderer2', ['appendChild']);
    const texture = jasmine.createSpyObj('TextureOne', ['getPattern']);
    spyOn(service, 'returnTexture').and.returnValue(texture);
    service.getTextureElement(1, { rgb: { r: 100, g: 100, b: 100 }, a: 0.6 }, 2, 2, renderer2Spy);
    expect(texture.getPattern).toHaveBeenCalled();
  });

  it('should get texture element when null', () => {
    spyOn(service, 'returnTexture').and.returnValue(null);
    const renderer2Spy = jasmine.createSpyObj('Renderer2', ['appendChild']);
    service.getTextureElement(1, { rgb: { r: 100, g: 100, b: 100 }, a: 0.6 }, 2, 2, renderer2Spy);
    expect(service.getTextureElement(1, { rgb: { r: 100, g: 100, b: 100 }, a: 0.6 }, 2, 2, renderer2Spy)).toBeNull();
  });
});
