import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PencilToolService } from 'src/app/services/tools/pencil-tool/pencil-tool.service';

@Component({
  selector: 'app-selection-stroke-parameter',
  templateUrl: './selection-stroke-parameter.component.html',
  styleUrls: ['./selection-stroke-parameter.component.scss'],
})

/// Le component d'affichage des paramètres du crayon
export class PencilToolParameterComponent implements OnInit {

  form: FormGroup;

  constructor(private pencilToolService: PencilToolService) { }

  ngOnInit() {
    this.form = this.pencilToolService.parameters;
  }

  get toolName(): string {
    return this.pencilToolService.toolName;
  }

  get strokeWidthValue(): number {
    return (this.form.get('strokeWidth') as FormControl).value;
  }
}
