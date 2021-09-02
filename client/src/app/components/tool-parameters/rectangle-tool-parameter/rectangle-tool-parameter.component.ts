import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RectangleStyle } from 'src/app/model/rectangle-style.model';
import { ToolRectangleService } from 'src/app/services/tools/tool-rectangle/tool-rectangle.service';

const FILL_ID = 0;
const CENTER_ID = 1;
const BORDER_ID = 2;

@Component({
  selector: 'app-rectangle-tool-parameter',
  templateUrl: './rectangle-tool-parameter.component.html',
  styleUrls: ['./rectangle-tool-parameter.component.scss'],
})

/// Le component d'affichage des paramètres du rectangle
export class RectangleToolParameterComponent implements OnInit {

  form: FormGroup;

  currentStyle = 0;

  styles: RectangleStyle[] = [
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
      rectStyle: this.styles[id].type,
    });
  }

  constructor(private rectangleToolService: ToolRectangleService) { }
  /// Assignation des parametre du service de rectangle au form
  ngOnInit(): void {
    this.form = this.rectangleToolService.parameters;
  }

  get toolName(): string {
    return this.rectangleToolService.toolName;
  }

}
