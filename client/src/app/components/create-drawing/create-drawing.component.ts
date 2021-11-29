import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DrawingType } from 'src/app/model/drawing-visibility.model';

@Component({
  selector: 'app-create-drawing',
  templateUrl: './create-drawing.component.html',
  styleUrls: ['./create-drawing.component.scss']
})
export class CreateDrawingComponent {

  drawingNameControl = new FormControl('', Validators.required);
  selectVisibilityControl = new FormControl('', Validators.required);
  teamNameControl = new FormControl('', Validators.required);

  public visibilityTypes: String[];
  public teamNames: String[];
  public constructor() {

    this.visibilityTypes = [DrawingType.Public, DrawingType.Protected, DrawingType.Private]
    this.teamNames = ['Moi-même', 'Équipe de collaboration']
  }

}
