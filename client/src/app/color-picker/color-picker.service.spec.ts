import { TestBed } from '@angular/core/testing';
import {
  HSL,
  MAX_HUE,
  MAX_LIGHTNESS,
  MAX_SATURATION
} from '../model/hsl.model';
import { RGB, RGB_MAX_VALUE } from '../model/rgb.model';
import { ColorTransformerService } from '../services/color-transformer/color-transformer.service';
import { ColorPickerService } from './color-picker.service';

describe('ColorPickerService', () => {
  let service: ColorPickerService;
  let colorTransformerServiceSpy: jasmine.SpyObj<ColorTransformerService>;
  let hslTestValue: HSL;
  let rgbTestValue: RGB;
  let hexTestValue: string;
  beforeEach(() => {
    const cTSSpy = jasmine.createSpyObj('ColorTransformerService', [
      'rgb2hex',
      'hsl2rgb',
      'hsl2hex',
      'rgb2hsl',
      'hex2hsl',
      'hex2rgb',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: ColorTransformerService, useValue: cTSSpy }],
    });
    hslTestValue = {
      h: Math.round(Math.random() * MAX_HUE),
      s: Math.round(Math.random() * MAX_SATURATION),
      l: Math.round(Math.random() * MAX_LIGHTNESS),
    };
    rgbTestValue = {
      r: Math.round(Math.random() * RGB_MAX_VALUE),
      g: Math.round(Math.random() * RGB_MAX_VALUE),
      b: Math.round(Math.random() * RGB_MAX_VALUE),
    };
    hexTestValue = '#' + Math.round(Math.random() * 16777215).toString(16);
    colorTransformerServiceSpy = TestBed.get(ColorTransformerService);
    colorTransformerServiceSpy.rgb2hex.and.returnValue(hexTestValue);
    colorTransformerServiceSpy.hsl2rgb.and.returnValue(rgbTestValue);
    colorTransformerServiceSpy.hsl2hex.and.returnValue(hexTestValue);
    colorTransformerServiceSpy.rgb2hsl.and.returnValue(hslTestValue);
    colorTransformerServiceSpy.hex2hsl.and.returnValue(hslTestValue);
    colorTransformerServiceSpy.hex2rgb.and.returnValue(rgbTestValue);
    service = TestBed.get(ColorPickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.hex.value).toBe(hexTestValue);
  });

  it('#setFormColor should update the form colors of rgb and a', () => {
    const rgb: RGB = { r: 120, g: 240, b: 100 };
    const a = 0.5;
    expect(service.rgb.value).not.toEqual(rgb);
    expect(service.a.value).not.toBe(a);
    service.setFormColor(rgb, a);
    expect(service.rgb.value).toEqual(rgb);
    expect(service.a.value).toBe(a);
  });

  it('should subscribe to the hsl value changes and update hex and rgb on creation', () => {
    const hsl: HSL = { h: 20, s: 0.8, l: 0.2 };
    hexTestValue = '#' + Math.round(Math.random() * 16777215).toString(16);
    colorTransformerServiceSpy.hsl2hex.and.returnValue(hexTestValue);
    service.hsl.setValue(hsl);
    expect(service.rgb.value).toEqual(rgbTestValue);
    expect(service.hex.value).toEqual(hexTestValue);
  });

  it('should subscribe to the rgb value changes and update hex and hsl on creation', () => {
    const rgb: RGB = { r: 20, g: 140, b: 200 };
    hexTestValue = '#' + Math.round(Math.random() * 16777215).toString(16);
    colorTransformerServiceSpy.rgb2hex.and.returnValue(hexTestValue);
    service.rgb.setValue(rgb);
    expect(service.hsl.value).toEqual(hslTestValue);
    expect(service.hex.value).toEqual(hexTestValue);
  });

  it('should subscribe to the hex value changes and update hsl and rgb on creation', () => {
    const hex: string = '#' + Math.round(Math.random() * 16777215).toString(16);
    service.hex.setValue(hex);
    expect(service.rgb.value).toEqual(rgbTestValue);
    expect(service.hsl.value).toEqual(hslTestValue);
  });

  it('should not update hex and rgb on unvalid hsl', () => {
    const hsl: HSL = { h: 800, s: 2, l: -1 };
    hexTestValue = '#' + Math.round(Math.random() * 16777215).toString(16);
    colorTransformerServiceSpy.hsl2hex.and.returnValue(hexTestValue);
    service.hsl.setValue(hsl);
    expect(service.rgb.value).not.toEqual(rgbTestValue);
    expect(service.hex.value).not.toEqual(hexTestValue);
  });

  it('should not update hex and hsl on unvalid rgb', () => {
    const rgb: RGB = { r: 999, g: -5, b: 10 };
    hexTestValue = '#' + Math.round(Math.random() * 16777215).toString(16);
    colorTransformerServiceSpy.rgb2hex.and.returnValue(hexTestValue);
    service.rgb.setValue(rgb);
    expect(service.hsl.value).not.toEqual(hslTestValue);
    expect(service.hex.value).not.toEqual(hexTestValue);
  });

  it('should not update hsl and rgb on unvalid hex', () => {
    const hex = '#FFFZFGFF';
    service.hex.setValue(hex);
    expect(service.rgb.value).not.toEqual(rgbTestValue);
    expect(service.hsl.value).not.toEqual(hslTestValue);
  });
});
