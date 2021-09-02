import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EllipseStyle } from 'src/app/model/ellipse-style.model';
import { ToolEllipseService } from 'src/app/services/tools/tool-ellipse/tool-ellipse.service';

const FILL_ID = 0;
const CENTER_ID = 1;
const BORDER_ID = 2;

@Component({
  selector: 'app-ellipse-tool-parameter',
  templateUrl: './ellipse-tool-parameter.component.html',
  styleUrls: ['./ellipse-tool-parameter.component.scss'],
})

/// Le component d'affichage des paramètres de l'ellipse
export class EllipseToolParameterComponent implements OnInit {

  form: FormGroup;

  currentStyle = 0;

  styles: EllipseStyle[] = [
    {
      id: FILL_ID,
      type: 'fill',
      tooltip: 'Rempli',
    },
    {
      id: CENTER_ID,
      type: 'center',
      tooltip: 'Centre',
    },
    {
      id: BORDER_ID,
      type: 'border',
      tooltip: 'Bordure',
    },
  ];

  /// Selection du style selon le numero de id
  selectStyle(id: number): void {
    this.currentStyle = id;
    this.form.patchValue({
      ellipseStyle: this.styles[id].type,
    });
  }

  constructor(private ellipseToolService: ToolEllipseService) { }
  /// Assignation des parametre du service de ellipse au form
  ngOnInit(): void {
    this.form = this.ellipseToolService.parameters;
  }

  get toolName(): string {
    return this.ellipseToolService.toolName;
  }
}
