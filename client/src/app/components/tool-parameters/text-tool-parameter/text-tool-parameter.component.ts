import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RectangleStyle } from 'src/app/model/rectangle-style.model';
import { TextToolService } from '../../../services/tools/text-tool/text-tool.service';
import { Polices } from '../../../model/polices.model';

const START = 0;
const MIDDLE = 1;
const END = 2;
const NORMAL = 0;
const BOLD = 1;
const ITALIC = 2;

@Component({
  selector: 'app-text-tool-parameter',
  templateUrl: './text-tool-parameter.component.html',
  styleUrls: ['./text-tool-parameter.component.scss'],
})
export class TextToolParameterComponent implements OnInit {

  get toolName(): string {
    return this.textToolService.toolName;
  }

  get policeSize(): number {

    return (this.form.get('fontSize') as FormControl).value;
  }

  get police(): string {
    return (this.form.get('fontFamily') as FormControl).value;
  }

  get textStyle(): string {
    return (this.form.get('textStyle') as FormControl).value;
  }

  get textAlignment(): string {
    return (this.form.get('textAlignment') as FormControl).value;
  }

  form: FormGroup;

  currentAlignment = NORMAL;
  currentStyle = START;
  polices = Polices;

  alignment: RectangleStyle[] = [
    {
      id: START,
      type: 'start',
      tooltip: 'start',
    },
    {
      id: MIDDLE,
      type: 'middle',
      tooltip: 'middle',
    },
    {
      id: END,
      type: 'end',
      tooltip: 'end',
    },
  ];

  style: RectangleStyle[] = [
    {
      id: NORMAL,
      type: 'normal',
      tooltip: 'normal',
    },
    {
      id: BOLD,
      type: 'bold',
      tooltip: 'bold',
    },
    {
      id: ITALIC,
      type: 'italic',
      tooltip: 'italic',
    },
  ];

  constructor(private textToolService: TextToolService) { }

  ngOnInit() {
    this.form = this.textToolService.parameters;
  }

  /// Selection de l'alignement selon le numero de id
  selectAlignment(id: number): void {
    this.currentAlignment = id;
    this.form.patchValue({
      textAlignment: this.alignment[id].type,
    });
  }

  /// Selection du style selon le numero de id
  selectStyle(id: number): void {
    this.currentStyle = id;
    this.form.patchValue({
      textStyle: this.style[id].type,
    });
  }

  selectPolice(id: number): void {
    this.form.patchValue({
      fontFamily: this.police[id],
    });
  }

}
