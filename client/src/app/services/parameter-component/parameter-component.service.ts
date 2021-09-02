import { Injectable, Type } from '@angular/core';
import { ControlMenuComponent } from 'src/app/components/control-menu/control-menu.component';
import { ApplierToolParameterComponent } from 'src/app/components/tool-parameters/applier-tool-parameter/applier-tool-parameter.component';
import { BrushToolParameterComponent } from 'src/app/components/tool-parameters/brush-tool-parameter/brush-tool-parameter.component';
import { BucketFillToolParameterComponent } from 'src/app/components/tool-parameters/bucket-fill-tool-parameter/bucket-fill-tool-parameter.component';
import { EllipseToolParameterComponent } from 'src/app/components/tool-parameters/ellipse-tool-parameter/ellipse-tool-parameter.component';
import { EraserToolParameterComponent } from 'src/app/components/tool-parameters/eraser-tool-parameter/eraser-tool-parameter.component';
import { FeatherToolParameterComponent } from 'src/app/components/tool-parameters/feather-tool-parameter/feather-tool-parameter.component';
import { GridParameterComponent } from 'src/app/components/tool-parameters/grid-parameter/grid-parameter.component';
import { LineToolParameterComponent } from 'src/app/components/tool-parameters/line-tool-parameter/line-tool-parameter.component';
import { PenToolParameterComponent } from 'src/app/components/tool-parameters/pen-tool-parameter/pen-tool-parameter.component';
import { PencilToolParameterComponent } from 'src/app/components/tool-parameters/pencil-tool-parameter/pencil-tool-parameter.component';
import { PipetteToolParameterComponent } from 'src/app/components/tool-parameters/pipette-tool-parameter/pipette-tool-parameter.component';
import { PolygonToolParameterComponent } from 'src/app/components/tool-parameters/polygon-tool-parameter/polygon-tool-parameter.component';
import { RectangleToolParameterComponent } from 'src/app/components/tool-parameters/rectangle-tool-parameter/rectangle-tool-parameter.component';
import { SelectionToolParameterComponent } from 'src/app/components/tool-parameters/selection-tool-parameter/selection-tool-parameter.component';
import { SprayToolParameterComponent } from 'src/app/components/tool-parameters/spray-tool-parameter/spray-tool-parameter.component';
import { StampToolParameterComponent } from 'src/app/components/tool-parameters/stamp-tool-parameter/stamp-tool-parameter.component';
import { TextToolParameterComponent } from 'src/app/components/tool-parameters/text-tool-parameter/text-tool-parameter.component';

/// Classe permettant d'offrir dyamiquement des component selon un index
@Injectable({
  providedIn: 'root',
})
export class ParameterComponentService {

  private parameterComponentList: Type<any>[] = [];
  constructor() {
    this.parameterComponentList.push(
      SelectionToolParameterComponent,
      EraserToolParameterComponent,
      PencilToolParameterComponent,
      BrushToolParameterComponent,
      FeatherToolParameterComponent,
      PenToolParameterComponent,
      RectangleToolParameterComponent,
      EllipseToolParameterComponent,
      PolygonToolParameterComponent,
      LineToolParameterComponent,
      StampToolParameterComponent,
      SprayToolParameterComponent,
      TextToolParameterComponent,
      ApplierToolParameterComponent,
      BucketFillToolParameterComponent,
      PipetteToolParameterComponent,
    );
    // Le push se fait par la suite pour s'assurer qu'il s'agit de la derniere classe
    this.parameterComponentList.push(GridParameterComponent);
    this.parameterComponentList.push(ControlMenuComponent);
  }

  /// Retourne le parameterComponent de l'index donner
  getComponent(index: number): Type<any> {
    return this.parameterComponentList[index];
  }
}
