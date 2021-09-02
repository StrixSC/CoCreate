import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonToggleChange, MatCheckbox, MatCheckboxChange } from '@angular/material';
import { GridColor } from 'src/app/model/grid-model';
import { GridService } from 'src/app/services/tools/grid-tool/grid.service';

const BLACK_ID = 0;
const WHITE_ID = 1;

@Component({
  selector: 'app-grid-parameter',
  templateUrl: './grid-parameter.component.html',
  styleUrls: ['./grid-parameter.component.scss'],
})
export class GridParameterComponent implements OnInit {
  @ViewChild(MatCheckbox, { static: false })
  matCheckbox: MatCheckbox;
  form: FormGroup;

  readonly FIRST_ANCHOR = 1;
  readonly SECOND_ANCHOR = 2;
  readonly THIRD_ANCHOR = 3;
  readonly FOURTH_ANCHOR = 4;
  readonly FIFTH_ANCHOR = 5;
  readonly SIXTH_ANCHOR = 6;
  readonly SEVENTH_ANCHOR = 7;
  readonly EIGTH_ANCHOR = 8;
  readonly NINETH_ANCHOR = 9;

  constructor(private gridService: GridService) { }
  styles: GridColor[] = [
    {
      id: BLACK_ID,
      style: 'black',
      tooltip: 'Noir',
    },
    {
      id: WHITE_ID,
      style: 'white',
      tooltip: 'Blanc',
    },
  ];

  ngOnInit(): void {
    this.form = this.gridService.parameters;
    this.activateGrid.valueChanges.subscribe((value: boolean) => {
      this.matCheckbox.checked = value;
    });
  }

  get cellSizeValue(): number {
    return (this.form.get('sizeCell') as FormControl).value;
  }

  get opacityValue(): number {
    return (this.form.get('transparence') as FormControl).value;
  }

  get anchorValue(): number {
    return (this.form.get('anchorPointMagnetism') as FormControl).value;
  }

  get activateGrid(): FormControl {
    return (this.form.get('activateGrid') as FormControl);
  }

  get activateMagnetism(): FormControl {
    return (this.form.get('activateMagnetism') as FormControl);
  }

  get toolName(): string {
    return this.gridService.toolName;
  }

  changeColor(event: MatButtonToggleChange) {
    this.form.patchValue({
      color: this.styles[event.value].style,
    });
  }

  changeAnchor(event: MatButtonToggleChange) {
    this.form.patchValue({
      anchorPointMagnetism: event.value,
    });
  }

  onSelection(event: MatCheckboxChange) {
    this.activateGrid.patchValue(event.checked);
  }

  onMagnetismSelection(event: MatCheckboxChange) {
    this.activateMagnetism.patchValue(event.checked);
  }
}
