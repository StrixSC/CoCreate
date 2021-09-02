import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PenToolService } from 'src/app/services/tools/pen-tool/pen-tool.service';

@Component({
  selector: 'app-pen-tool-parameter',
  templateUrl: './pen-tool-parameter.component.html',
  styleUrls: ['./pen-tool-parameter.component.scss'],
})
export class PenToolParameterComponent implements OnInit {

  form: FormGroup;

  constructor(private penToolService: PenToolService) { }

  ngOnInit() {
    this.form = this.penToolService.parameters;
  }

  get toolName(): string {
    return this.penToolService.toolName;
  }

  get minStrokeWidthValue(): number {
    return (this.form.get('minStrokeWidth') as FormControl).value;
  }

  get maxStrokeWidthValue(): number {
    return (this.form.get('maxStrokeWidth') as FormControl).value;
  }

}
