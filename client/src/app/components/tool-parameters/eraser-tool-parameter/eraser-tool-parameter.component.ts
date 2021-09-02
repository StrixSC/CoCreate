import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EraserToolService } from 'src/app/services/tools/eraser-tool/eraser-tool.service';

@Component({
  selector: 'app-eraser-tool-parameter',
  templateUrl: './eraser-tool-parameter.component.html',
  styleUrls: ['./eraser-tool-parameter.component.scss'],
})
export class EraserToolParameterComponent implements OnInit {

  form: FormGroup;

  constructor(private eraserToolService: EraserToolService) { }

  /// Assignation des parametre du service de ellipse au form
  ngOnInit(): void {
    this.form = this.eraserToolService.parameters;
  }
  get toolName(): string {
    return this.eraserToolService.toolName;
  }

  get eraserWidth(): number {
    return this.eraserToolService.parameters.value.eraserSize;
  }
}
