import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FeatherToolService } from 'src/app/services/tools/feather-tool/feather-tool.service';

@Component({
  selector: 'app-feather-tool-parameter',
  templateUrl: './feather-tool-parameter.component.html',
  styleUrls: ['./feather-tool-parameter.component.scss'],
})
export class FeatherToolParameterComponent implements OnInit {
  form: FormGroup;

  constructor(
    private featherToolService: FeatherToolService,
    ) {
      this.form = this.featherToolService.parameters;

     }

  ngOnInit() {
    this.form = this.featherToolService.parameters;
  }

  get toolName(): string {
    return this.featherToolService.toolName;
  }

  }
