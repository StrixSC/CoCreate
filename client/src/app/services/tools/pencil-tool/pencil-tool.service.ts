import { Point } from 'src/app/model/point.model';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { DrawingState } from "./../../../model/IAction.model";
import { SyncDrawingService } from "../../syncdrawing.service";
import { Injectable } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { faPencilAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { ICommand } from "src/app/interfaces/command.interface";
import { ISendCoordPayload } from "src/app/model/ISendCoordPayload.model";
import { SelectionToolService } from "src/app/services/tools/selection-tool/selection-tool.service";
import { Tools } from "../../../interfaces/tools.interface";
import { DrawingService } from "../../drawing/drawing.service";
import { ToolsColorService } from "../../tools-color/tools-color.service";
import { ToolIdConstants } from "../tool-id-constants";
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from "../tools-constants";
import { PencilCommand } from "./pencil-command";
import { Pencil } from "./pencil.model";

/// Service de l'outil pencil, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: "root",
})
export class PencilToolService implements Tools {
  readonly toolName = "Outil Crayon";
  readonly faIcon: IconDefinition = faPencilAlt;
  readonly id = ToolIdConstants.PENCIL_ID;
  private strokeWidth: FormControl;
  private pencil: Pencil | null;
  parameters: FormGroup;
  private activePointsList: Point[] = [];
  coords: ISendCoordPayload;
  isDrawing: boolean;

  constructor(
    private colorTool: ToolsColorService,
    private syncDrawingService: SyncDrawingService,
  ) {
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
    });
    this.isDrawing = false;
  }

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    if (this.isDrawing) {
      return;
    }

    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.strokeWidth.valid) {
        const offset: { x: number; y: number } = {
          x: event.offsetX,
          y: event.offsetY,
        };

        this.pencil = {
          pointsList: [offset],
          strokeWidth: this.strokeWidth.value,
          fill: "none",
          stroke: "none",
          fillOpacity: "none",
          strokeOpacity: "none",
        };

        if (event.button === LEFT_CLICK) {
          this.pencil.stroke = this.colorTool.primaryColorString;
          this.pencil.strokeOpacity = this.colorTool.primaryAlpha.toString();
        } else {
          this.pencil.stroke = this.colorTool.secondaryColorString;
          this.pencil.strokeOpacity = this.colorTool.secondaryAlpha.toString();
        }
        this.activePointsList.push(offset);
        this.syncDrawingService.sendFreedraw(DrawingState.down, this.pencil, false);
        this.isDrawing = true;
      }
    }
  }

  /// Ajout d'un point selon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if (this.isDrawing && this.pencil) {
      this.pencil.pointsList = [{ x: event.offsetX, y: event.offsetY }];
      this.activePointsList.push({ x: event.offsetX, y: event.offsetY });
      this.syncDrawingService.sendFreedraw(DrawingState.move, this.pencil);
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void | ICommand {
    if (this.isDrawing && this.pencil) {
      this.pencil.pointsList = this.activePointsList;
      this.activePointsList = [];
      this.syncDrawingService.sendFreedraw(DrawingState.up, this.pencil);
      this.isDrawing = false;
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    return;
  }

  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  pickupTool(): void {
    return;
  }

  dropTool(): void {
    return;
  }
}
