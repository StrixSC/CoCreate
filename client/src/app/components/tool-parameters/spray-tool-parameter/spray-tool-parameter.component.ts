import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SprayToolService } from 'src/app/services/tools/spray-tool/spray-tool.service';

@Component({
  selector: 'app-spray-tool-parameter',
  templateUrl: './spray-tool-parameter.component.html',
  styleUrls: ['./spray-tool-parameter.component.scss'],
})
export class SprayToolParameterComponent implements OnInit {

  form: FormGroup;

  constructor(private sprayToolService: SprayToolService) { }

  ngOnInit() {
    this.form = this.sprayToolService.parameters;
  }

  get toolName(): string {
    return this.sprayToolService.toolName;
  }

  get diameter(): number {
    return (this.form.get('diameter') as FormControl).value;
  }

  get emissionPerSecond(): number {
    return (this.form.get('emissionPerSecond') as FormControl).value;
  }

  get circleRadius(): number {
    return (this.form.get('circleRadius') as FormControl).value;
  }

}
