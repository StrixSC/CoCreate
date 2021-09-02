import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DEFAULT_RGB_COLOR, RGB, RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { HSL, MAX_HUE, MAX_LIGHTNESS, MAX_SATURATION } from '../model/hsl.model';
import { DEFAULT_ALPHA } from '../model/rgba.model';
import { ColorTransformerService } from '../services/color-transformer/color-transformer.service';

/// Service pour gérer le form du color picker
@Injectable(
  { providedIn: 'root' },
)
export class ColorPickerService {

  colorForm: FormGroup;
  rgb: FormGroup;
  hsl: FormGroup;
  a: FormControl;
  hex: FormControl;

  private formBuilder: FormBuilder;
  private rgbValueChangeSub: Subscription;
  private hslValueChangeSub: Subscription;
  private hexValueChangeSub: Subscription;

  /// Initialise le form dans le constructeur
  constructor(private colorTransformerService: ColorTransformerService) {
    this.formBuilder = new FormBuilder();
    this.rgb = this.formBuilder.group({
      r: this.formBuilder.control(RGB_MAX_VALUE,
        [Validators.required, Validators.max(RGB_MAX_VALUE), Validators.min(0), Validators.pattern('[0-9]*')]),
      g: this.formBuilder.control(RGB_MAX_VALUE,
        [Validators.required, Validators.max(RGB_MAX_VALUE), Validators.min(0), Validators.pattern('[0-9]*')]),
      b: this.formBuilder.control(RGB_MAX_VALUE,
        [Validators.required, Validators.max(RGB_MAX_VALUE), Validators.min(0), Validators.pattern('[0-9]*')]),
    });
    this.hsl = this.formBuilder.group({
      h: this.formBuilder.control(MAX_HUE / 2,
        [Validators.required, Validators.max(MAX_HUE), Validators.min(0)]),
      s: this.formBuilder.control(MAX_SATURATION,
        [Validators.required, Validators.max(MAX_SATURATION), Validators.min(0)]),
      l: this.formBuilder.control(MAX_LIGHTNESS,
        [Validators.required, Validators.max(MAX_LIGHTNESS), Validators.min(0)]),
    });
    this.a = this.formBuilder.control(DEFAULT_ALPHA, [Validators.required, Validators.max(1), Validators.min(0)]);
    this.hex = this.formBuilder.control(this.colorTransformerService.rgb2hex(DEFAULT_RGB_COLOR),
      [Validators.required, Validators.pattern(/^#?([a-fA-F\d]{1,2})([a-fA-F\d]{0,2})([a-fA-F\d]{0,2})$/i)]);
    this.colorForm = this.formBuilder.group({
      hsl: this.hsl,
      rgb: this.rgb,
      a: this.a,
      hex: this.hex,
    });
    this.setHSLSubscribe();
    this.setRGBSubscribe();
    this.setHEXSubscribe();
  }

  /// Permet de modifier la valeur HSL sans avoir une dépendance circulaire de valueChanges
  private setHSLSubscribe(): void {
    this.hslValueChangeSub = this.hsl.valueChanges.subscribe((hsl: HSL) => {
      this.rgbValueChangeSub.unsubscribe();
      this.hexValueChangeSub.unsubscribe();
      if (this.hsl.valid) {
        this.rgb.setValue(this.colorTransformerService.hsl2rgb(hsl));
        this.hex.setValue(this.colorTransformerService.hsl2hex(hsl));
      }
      this.setRGBSubscribe();
      this.setHEXSubscribe();
    });
  }

  /// Permet de modifier la valeur RGB sans avoir une dépendance circulaire de valueChanges
  private setRGBSubscribe(): void {
    this.rgbValueChangeSub = this.rgb.valueChanges.subscribe((rgb: RGB) => {
      this.hslValueChangeSub.unsubscribe();
      this.hexValueChangeSub.unsubscribe();
      if (this.rgb.valid) {
        this.hsl.setValue(this.colorTransformerService.rgb2hsl(rgb));
        this.hex.setValue(this.colorTransformerService.rgb2hex(rgb));
      }
      this.setHSLSubscribe();
      this.setHEXSubscribe();
    });
  }

  /// Permet de modifier la valeur HEX sans avoir une dépendance circulaire de valueChanges
  private setHEXSubscribe(): void {
    this.hexValueChangeSub = this.hex.valueChanges.subscribe((hex: string) => {
      this.rgbValueChangeSub.unsubscribe();
      this.hslValueChangeSub.unsubscribe();
      if (this.hex.valid) {
        this.hsl.setValue(this.colorTransformerService.hex2hsl(hex));
        this.rgb.setValue(this.colorTransformerService.hex2rgb(hex));
      }
      this.setHSLSubscribe();
      this.setRGBSubscribe();
    });
  }

  /// Modifie la valeur du form selon un rgb et un alpha
  setFormColor(rgb: RGB, a: number) {
    this.rgb.setValue(rgb);
    this.a.setValue(a);
  }
}
