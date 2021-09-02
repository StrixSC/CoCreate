import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { RGBA } from '../../model/rgba.model';
import { ToolsColorService } from '../../services/tools-color/tools-color.service';

@Component({
  selector: 'app-tools-color-picker',
  templateUrl: './tools-color-picker.component.html',
  styleUrls: ['./tools-color-picker.component.scss'],
})
export class ToolsColorPickerComponent implements OnInit, AfterViewInit {

  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ToolsColorPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RGBA,
    private toolsColor: ToolsColorService,
    private colorPickerService: ColorPickerService) { }

  /// Appliquer la couleur au form
  ngOnInit(): void {
    this.colorPickerService.setFormColor(this.data.rgb, this.data.a);
    this.form = this.colorPickerService.colorForm;
  }
  /// Assigne au au component le valeur de la couleur la couleur dans le form change
  ngAfterViewInit(): void {
    this.colorPickerService.colorForm.valueChanges.subscribe(() => {
      this.data.rgb = this.colorPickerService.rgb.value;
      this.data.a = this.colorPickerService.a.value;
    });
  }
  /// applique la couleur selectionne
  selectLastColor(rgba: RGBA): void {
    this.colorPickerService.setFormColor(rgba.rgb, rgba.a);
  }

  /// genere le string associe aux valeurs de la  couleur

  rgba2rgbaString(rgba: RGBA): string {
    return 'rgb(' + rgba.rgb.r + ',' + rgba.rgb.g + ',' + rgba.rgb.b + ',' + rgba.a + ')';
  }

  get lastColors(): RGBA[] {
    return this.toolsColor.lastSelectedColors.reverse();
  }

  /// ferme la boite de dialogue
  close(): void {
    this.dialogRef.close();
  }
}
