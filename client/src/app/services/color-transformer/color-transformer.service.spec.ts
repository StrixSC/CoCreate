import { TestBed } from '@angular/core/testing';

import { ColorTransformerService } from './color-transformer.service';

describe('ColorTransformerService', () => {
  let colorTransformerService: ColorTransformerService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    colorTransformerService = new ColorTransformerService();
  });

  it('should be created', () => {
    const service: ColorTransformerService = TestBed.get(ColorTransformerService);
    expect(service).toBeTruthy();
  });

  it('#rgb2hsl with value between the limits of rgb', () => {
    expect(colorTransformerService.rgb2hsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(colorTransformerService.rgb2hsl({ r: 200, g: 200, b: 200 })).toEqual({ h: 0, s: 0, l: 0.784 });
    expect(colorTransformerService.rgb2hsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 1 });
    expect(colorTransformerService.rgb2hsl({ r: 250, g: 200, b: 180 })).toEqual({ h: 17, s: 0.874, l: 0.843 });
    expect(colorTransformerService.rgb2hsl({ r: 200, g: 250, b: 180 })).toEqual({ h: 103, s: 0.874, l: 0.843 });
    expect(colorTransformerService.rgb2hsl({ r: 180, g: 250, b: 200 })).toEqual({ h: 137, s: 0.874, l: 0.843 });
    expect(colorTransformerService.rgb2hsl({ r: 180, g: 200, b: 250 })).toEqual({ h: 223, s: 0.874, l: 0.843 });
    expect(colorTransformerService.rgb2hsl({ r: 200, g: 180, b: 250 })).toEqual({ h: 257, s: 0.874, l: 0.843 });
    expect(colorTransformerService.rgb2hsl({ r: 250, g: 180, b: 200 })).toEqual({ h: 343, s: 0.874, l: 0.843 });

  });

  it('#rgb2hsl with value outside the limits', () => {
    expect(colorTransformerService.rgb2hsl({ r: -10, g: -10, b: -10 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(colorTransformerService.rgb2hsl({ r: 300, g: 300, b: 300 })).toEqual({ h: 0, s: 0, l: 1 });
  });

  it('#hsl2rgb with the limits of saturation and lightness', () => {
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 1, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 1, l: 1 })).toEqual({ r: 255, g: 255, b: 255 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 0, l: 1 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('#hsl2rgb with values above and below the limits of saturation and lightness', () => {
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 0, l: 1.2 })).toEqual({ r: 255, g: 255, b: 255 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 0, l: -1 })).toEqual({ r: 0, g: 0, b: 0 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 1.2, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: -1, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('#hsl2rgb with different value of saturation an lightness', () => {
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 1, l: 0.5 })).toEqual({ r: 255, g: 213, b: 0 });
    expect(colorTransformerService.hsl2rgb({ h: 50, s: 0, l: 0.5 })).toEqual({ r: 128, g: 128, b: 128 });
    expect(colorTransformerService.hsl2rgb({ h: 120, s: 0.5, l: 0.5 })).toEqual({ r: 64, g: 191, b: 64 });
    expect(colorTransformerService.hsl2rgb({ h: 120, s: 0.75, l: 0.75 })).toEqual({ r: 143, g: 239, b: 143 });
    expect(colorTransformerService.hsl2rgb({ h: 120, s: 0.25, l: 0.25 })).toEqual({ r: 48, g: 80, b: 48 });
    expect(colorTransformerService.hsl2rgb({ h: 120, s: 0.25, l: 0.75 })).toEqual({ r: 175, g: 207, b: 175 });
    expect(colorTransformerService.hsl2rgb({ h: 120, s: 0.75, l: 0.25 })).toEqual({ r: 16, g: 112, b: 16 });
  });

  it('#hue2rgb wiht values between 0 to 360', () => {
    expect(colorTransformerService.hue2rgb(50)).toEqual({ r: 255, g: 213, b: 0 });
    expect(colorTransformerService.hue2rgb(100)).toEqual({ r: 85, g: 255, b: 0 });
    expect(colorTransformerService.hue2rgb(140)).toEqual({ r: 0, g: 255, b: 85 });
    expect(colorTransformerService.hue2rgb(190)).toEqual({ r: 0, g: 213, b: 255 });
    expect(colorTransformerService.hue2rgb(260)).toEqual({ r: 85, g: 0, b: 255 });
    expect(colorTransformerService.hue2rgb(310)).toEqual({ r: 255, g: 0, b: 212 });
  });

  it('#hue2rgb with value above 360', () => {
    expect(colorTransformerService.hue2rgb(370)).toEqual({ r: 255, g: 42, b: 0 });
  });

  it('#hue2rgb with value under 0', () => {
    expect(colorTransformerService.hue2rgb(-30)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('#hex2rgb with a good hex value', () => {
    const rgb = colorTransformerService.hex2rgb('#ff0a10');
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(10);
    expect(rgb.b).toBe(16);
  });

  it('#hex2rgb with a bad hex value', () => {
    const rgb = colorTransformerService.hex2rgb('');
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(255);
  });

  it('rgb2hex with a good rgb value', () => {
    expect(colorTransformerService.rgb2hex({ r: 16, g: 255, b: 8 })).toBe('#10ff08');
    expect(colorTransformerService.rgb2hex({ r: 15, g: 15, b: 255 })).toBe('#0f0fff');
  });

  it('hsl2hex with good hsl value', () => {
    expect(colorTransformerService.hsl2hex({ h: 118, s: 1, l: 0.52 })).toEqual('#12ff0a');
  });

  it('hex2hsl with good hex value', () => {
    expect(colorTransformerService.hex2hsl('#10ff08')).toEqual({ h: 118, s: 1.001, l: 0.516 });
  });

  it('hue2hex with good hue value', () => {
    expect(colorTransformerService.hue2hex(118)).toEqual('#09ff00');
  });

  it('#clamp give back the value max is la value > max', () => {
    expect(colorTransformerService.clamp(20, 0, 18)).toEqual(18);
  });

  it('#clamp give back the value min is la value < min', () => {
    expect(colorTransformerService.clamp(4, 6, 18)).toEqual(6);
  });

  it('#clamp give back the value', () => {
    expect(colorTransformerService.clamp(8, 6, 18)).toEqual(8);
  });

});
