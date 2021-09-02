import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModules } from '../app-material.module';
import { ColorOpacityComponent } from './color-opacity/color-opacity.component';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { ColorRgbaHexComponent } from './color-rgba-hex/color-rgba-hex.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';
import { ColorSquareComponent } from './color-square/color-square.component';

@NgModule({
  declarations: [
    ColorOpacityComponent,
    ColorPaletteComponent,
    ColorPickerComponent,
    ColorRgbaHexComponent,
    ColorSliderComponent,
    ColorSquareComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModules,
  ],
  exports: [
    ColorPickerComponent,
  ],
})
export class ColorPickerModule { }
