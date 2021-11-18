import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { VisibilityType } from 'src/app/model/drawing-visibility.model';

const X_SIZE: { width: number, height: number, x: number, y: number } = { width: 12, height: 12, x: 1, y: 11 };
const MIN_DIMENSION = 1;
@Component({
  selector: 'app-new-drawing-form',
  templateUrl: './new-drawing-form.component.html',
  styleUrls: ['./new-drawing-form.component.scss'],
})
export class NewDrawingFormComponent {

  readonly minDimension: number = MIN_DIMENSION;
  readonly xSize: { width: number, height: number, x: number, y: number } = X_SIZE;
  /// Cree un nouveau form pour la grosseur
  @Input()
  newDrawingForm: FormGroup;
  //@Input() selectedType: string;
  //@ViewChild('password', {static: false}) type: string;
  //@ViewChild('visibility', {static: false}) selectedType: string;

    
    public visibilityTypes: String[];
    public teamNames: String[];
    private selectedType: String;
    public constructor(){
      
      this.visibilityTypes = [VisibilityType.public, VisibilityType.private,  VisibilityType.protected];
      this.teamNames = ['Moi-même', 'Équipe de collaboration'];
      this.selectedType= '';
      
    }
}
