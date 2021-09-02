import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PencilToolService } from 'src/app/services/tools/pencil-tool/pencil-tool.service';

@Component({
  selector: 'app-pencil-tool-parameter',
  templateUrl: './pencil-tool-parameter.component.html',
  styleUrls: ['./pencil-tool-parameter.component.scss'],
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
