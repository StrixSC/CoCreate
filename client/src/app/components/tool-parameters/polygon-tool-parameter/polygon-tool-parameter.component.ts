import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PolygonStyle } from 'src/app/model/polygon-style.model';
import { PolygonToolService } from 'src/app/services/tools/polygon-tool/polygon-tool.service';

const FILL_ID = 0;
const CENTER_ID = 1;
const BORDER_ID = 2;

@Component({
  selector: 'app-polygon-tool-parameter',
  templateUrl: './polygon-tool-parameter.component.html',
  styleUrls: ['./polygon-tool-parameter.component.scss'],
})

/// Le component d'affichage des paramètres de l'ellipse
export class PolygonToolParameterComponent implements OnInit {

  form: FormGroup;

  currentStyle = 0;

  styles: PolygonStyle[] = [
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
      polygonStyle: this.styles[id].type,
    });
  }

  constructor(private polygonToolService: PolygonToolService) { }
  /// Assignation des parametre du service de ellipse au form
  ngOnInit(): void {
    this.form = this.polygonToolService.parameters;
  }

  get toolName(): string {
    return this.polygonToolService.toolName;
  }
}
