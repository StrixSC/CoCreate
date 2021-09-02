import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MaterialModules } from '../../app-material.module';
import { ApplierToolParameterComponent } from './applier-tool-parameter/applier-tool-parameter.component';
import { BrushToolParameterComponent } from './brush-tool-parameter/brush-tool-parameter.component';
import { BucketFillToolParameterComponent } from './bucket-fill-tool-parameter/bucket-fill-tool-parameter.component';
import { EllipseToolParameterComponent } from './ellipse-tool-parameter/ellipse-tool-parameter.component';
import { EraserToolParameterComponent } from './eraser-tool-parameter/eraser-tool-parameter.component';
import { FeatherToolParameterComponent } from './feather-tool-parameter/feather-tool-parameter.component';
import { GridParameterComponent } from './grid-parameter/grid-parameter.component';
import { LineToolParameterComponent } from './line-tool-parameter/line-tool-parameter.component';
import { PenToolParameterComponent } from './pen-tool-parameter/pen-tool-parameter.component';
import { PencilToolParameterComponent } from './pencil-tool-parameter/pencil-tool-parameter.component';
import { PipetteToolParameterComponent } from './pipette-tool-parameter/pipette-tool-parameter.component';
import { PolygonToolParameterComponent } from './polygon-tool-parameter/polygon-tool-parameter.component';
import { RectangleToolParameterComponent } from './rectangle-tool-parameter/rectangle-tool-parameter.component';
import { SelectionToolParameterComponent } from './selection-tool-parameter/selection-tool-parameter.component';
import { SprayToolParameterComponent } from './spray-tool-parameter/spray-tool-parameter.component';
import { StampToolParameterComponent } from './stamp-tool-parameter/stamp-tool-parameter.component';
import { TextToolParameterComponent } from './text-tool-parameter/text-tool-parameter.component';

@NgModule({
  declarations: [
    PencilToolParameterComponent,
    RectangleToolParameterComponent,
    BrushToolParameterComponent,
    ApplierToolParameterComponent,
    EllipseToolParameterComponent,
    PipetteToolParameterComponent,
    StampToolParameterComponent,
    PolygonToolParameterComponent,
    GridParameterComponent,
    LineToolParameterComponent,
    SelectionToolParameterComponent,
    EraserToolParameterComponent,
    TextToolParameterComponent,
    PenToolParameterComponent,
    FeatherToolParameterComponent,
    BucketFillToolParameterComponent,
    SprayToolParameterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModules,
    FontAwesomeModule,
  ],
  exports: [
  ],
  entryComponents: [
    BrushToolParameterComponent,
    PencilToolParameterComponent,
    RectangleToolParameterComponent,
    ApplierToolParameterComponent,
    EllipseToolParameterComponent,
    PipetteToolParameterComponent,
    StampToolParameterComponent,
    PolygonToolParameterComponent,
    GridParameterComponent,
    LineToolParameterComponent,
    SelectionToolParameterComponent,
    EraserToolParameterComponent,
    TextToolParameterComponent,
    PenToolParameterComponent,
    FeatherToolParameterComponent,
    BucketFillToolParameterComponent,
    SprayToolParameterComponent,
  ],
})
export class ToolParameterModule { }
