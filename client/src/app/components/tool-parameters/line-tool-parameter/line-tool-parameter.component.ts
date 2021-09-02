import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RectangleStyle } from 'src/app/model/rectangle-style.model';
import { LineToolService } from '../../../services/tools/line-tool/line-tool.service';

const LIGNE = 0;
const POINTILLE_TRAIT = 1;
const POINTILLE_POINT = 2;
const ARRONDI = 0;
const EN_ANGLE = 1;
const AVEC_POINT = 2;

@Component({
  selector: 'app-line-tool-parameter',
  templateUrl: './line-tool-parameter.component.html',
  styleUrls: ['./line-tool-parameter.component.scss'],
})
export class LineToolParameterComponent implements OnInit {
  constructor(private lineToolService: LineToolService) { }

  get toolName(): string {
    return this.lineToolService.toolName;
  }

  get strokeWidthValue(): number {
    return (this.form.get('strokeWidth') as FormControl).value;
  }

  get diameter(): number {

    return (this.form.get('diameter') as FormControl).value;
  }

  currentStyleMotif = 0;
  currentStyleJonction = 0;

  motif: RectangleStyle[] = [
    {
      id: LIGNE,
      type: 'line',
      tooltip: 'ligne',
    },
    {
      id: POINTILLE_TRAIT,
      type: 'largeDasharray',
      tooltip: 'pointille (trait)',
    },
    {
      id: POINTILLE_POINT,
      type: 'smallDasharray',
      tooltip: 'pointille (point)',
    },
  ];

  jonction: RectangleStyle[] = [
    {
      id: ARRONDI,
      type: 'round',
      tooltip: 'arrondi',
    },
    {
      id: EN_ANGLE,
      type: 'angle',
      tooltip: 'en angle',
    },
    {
      id: AVEC_POINT,
      type: 'marker',
      tooltip: 'avec point',
    },
  ];

  form: FormGroup;
  formJonctionLigne: FormGroup;

  ngOnInit() {
    this.form = this.lineToolService.parameters;
    this.formJonctionLigne = this.lineToolService.parameters;
  }

  /// Selection du style selon le numero de id
  selectStyleMotif(id: number): void {
    this.currentStyleMotif = id;
    this.form.patchValue({
      rectStyleMotif: this.motif[id].type,
    });
    this.lineToolService.selectStyleMotif();
  }

  /// Selection du style selon le numero de id
  selectStyleJonction(id: number): void {
    this.currentStyleJonction = id;
    this.formJonctionLigne.patchValue({
      rectStyleJonction: this.jonction[id].type,
    });
    this.lineToolService.selectStyleJonction();
  }
}
