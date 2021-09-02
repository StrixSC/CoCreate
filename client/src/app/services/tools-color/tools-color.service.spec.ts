import { TestBed } from '@angular/core/testing';

import { ToolsColorService } from './tools-color.service';

describe('ToolsColorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    expect(service).toBeTruthy();
    expect(service.lastSelectedColors.length).toEqual(10);
    expect(service.lastSelectedColors[9]).toEqual({ rgb: { r: 0, g: 0, b: 0 }, a: 1 });
  });

  it('should set last color o array primary', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.setPrimaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.lastSelectedColors[9]).toEqual({ rgb: { r: 3, g: 3, b: 3 }, a: 0 });
  });

  it('should set last color of array secondary', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.setSecondaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.lastSelectedColors[9]).toEqual({ rgb: { r: 3, g: 3, b: 3 }, a: 0 });
  });

  it('should switch primary and secondary color', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    const tempColorP = service.primaryColor;
    const tempAlphaP = service.primaryAlpha;
    const tempColorS = service.secondaryColor;
    const tempAlphaS = service.secondaryAlpha;
    service.switchColor();

    expect(tempColorP).toEqual(service.secondaryColor);
    expect(tempAlphaP).toEqual(service.secondaryAlpha);
    expect(tempColorS).toEqual(service.primaryColor);
    expect(tempAlphaS).toEqual(service.primaryAlpha);
  });

  it('should set the primary color', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.setPrimaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.primaryColorString).toEqual('rgb(3,3,3)');
  });

  it('should set the secondary color', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.setSecondaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.secondaryColorString).toEqual('rgb(3,3,3)');
  });

  it('should not had same color at end of array', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.setSecondaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.lastSelectedColors[9]).toEqual({ rgb: { r: 3, g: 3, b: 3 }, a: 0 });
    expect(service.lastSelectedColors[8]).toEqual({ rgb: { r: 0, g: 0, b: 0 }, a: 1 });

    service.setSecondaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.lastSelectedColors[9]).toEqual({ rgb: { r: 3, g: 3, b: 3 }, a: 0 });
    expect(service.lastSelectedColors[8]).toEqual({ rgb: { r: 0, g: 0, b: 0 }, a: 1 });
  });

  it('should have a color array of 10', () => {
    const service: ToolsColorService = TestBed.get(ToolsColorService);
    service.lastSelectedColors.pop();
    expect(service.lastSelectedColors.length).toEqual(9);
    service.setSecondaryColor({ r: 3, g: 3, b: 3 }, 0);
    expect(service.lastSelectedColors.length).toEqual(10);
  });
});
