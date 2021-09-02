import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faProjectDiagram, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { KeyCodes } from '../../hotkeys/hotkeys-constants';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_WIDTH, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { LineCommand } from './line-command';
import { Line } from './line.model';

/// Service de l'outil ligne, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: 'root',
})
export class LineToolService implements Tools {
  readonly toolName = 'Outil Ligne';
  readonly faIcon: IconDefinition = faProjectDiagram;
  readonly id = ToolIdConstants.LINE_ID;

  private currentMouseLocation: Point;
  private line: Line;
  private lineCommand: LineCommand | null = null;
  private returnCommand = false;
  private isShiftPressed = false;
  private markerId = 0;
  private clickNumber = 0;

  private diameter: FormControl;
  private rectStyleMotif: FormControl;
  private rectStyleJonction: FormControl;
  private strokeWidth: FormControl;
  parameters: FormGroup;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
  ) {
    this.strokeWidth = new FormControl(INITIAL_WIDTH);
    this.diameter = new FormControl(3 * INITIAL_WIDTH);
    this.rectStyleMotif = new FormControl('line');
    this.rectStyleJonction = new FormControl('round');
    this.parameters = new FormGroup({
      strokeWidth: this.strokeWidth,
      diameter: this.diameter,
      rectStyleMotif: this.rectStyleMotif,
      rectStyleJonction: this.rectStyleJonction,
    });
  }

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.currentMouseLocation = offset;
      if (this.verifyDoubleClick()) {
        this.onDoublePressed();
        return;
      }
      if (this.strokeWidth.value > 0 && !this.lineCommand) {
        this.line = {
          diameter: this.diameter.value,
          markerId: this.markerId,
          pointsList: [offset],
          strokeWidth: this.strokeWidth.value,
          fill: 'none', stroke: 'none',
          fillOpacity: 'none', strokeOpacity: 'none',
          strokeLinecap: 'none', strokeLinejoin: 'none', strokeDasharray: 'none',
          markerVisibility: 'hidden',
        };
        this.markerId++;
        this.selectStyleJonction();
        this.selectStyleMotif();
        if (event.button === LEFT_CLICK) {
          this.line.stroke = this.colorTool.primaryColorString;
          this.line.strokeOpacity = this.colorTool.primaryAlpha.toString();
        } else {
          this.line.stroke = this.colorTool.secondaryColorString;
          this.line.strokeOpacity = this.colorTool.secondaryAlpha.toString();
        }
        this.lineCommand = new LineCommand(this.rendererService.renderer, this.line, this.drawingService);
        this.lineCommand.execute();
      }
      if (this.lineCommand) {
        this.lineCommand.addPoint(offset);
      }
    }

  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): ICommand | void {
    if (this.returnCommand && this.lineCommand) {
      const returnLineCommand = this.lineCommand;
      this.lineCommand = null;
      this.returnCommand = false;
      return returnLineCommand;
    }
  }

  /// Ajout d'un point seulon le déplacement de la souris
  onMove(event: MouseEvent): void {
    if (this.lineCommand && !this.returnCommand) {
      this.currentMouseLocation = this.offsetManager.offsetFromMouseEvent(event);
      this.lineCommand.updatePoint(this.currentMouseLocation);
    }
  }

  /// Verification de l'appui de la touche shift
  onKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      this.isShiftPressed = false;
    }
  }

  /// Verification de la touche appuyer pour effectuer le comportement voulu
  onKeyDown(event: KeyboardEvent): void {
    if (this.lineCommand) {
      if (event.code === KeyCodes.esc || (event.code === KeyCodes.backSpace && this.lineCommand.pointsLength <= 2)) {
        this.lineCommand.undo();
        this.lineCommand = null;
      } else if (event.code === KeyCodes.backSpace) {
        this.lineCommand.removeLastPoint();
        this.lineCommand.updatePoint(this.currentMouseLocation);
      }
    }
    if (event.shiftKey) {
      this.isShiftPressed = true;
    }
  }

  /// Verification du double clique
  private verifyDoubleClick(): boolean {
    /// si le nombre d'evenement est egale a  2 alors la fonction onDoublePressed peut etre appele
    this.clickNumber++;
    /// verification apres un delai
    if (this.clickNumber === 1) {
      /// apres 200ms seconde on remet le nombre d'evement a zero
      setTimeout(() => { this.clickNumber = 0; }, 200);
    }
    if (this.clickNumber >= 2) {
      this.clickNumber = 0;
      return true;
    }
    return false;
  }

  /// Action a effectuer lors du double clique
  private onDoublePressed(): void {
    if (this.lineCommand) {
      this.lineCommand.finishLine(this.isShiftPressed);
      this.returnCommand = true;
    }
  }

  /// Terminaison de la ligne lors du changement d'outil
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    this.onDoublePressed();
  }

  /// Ajustement du type de jonction de ligne
  selectStyleJonction(): void {
    if (this.line) {
      switch (this.rectStyleJonction.value) {
        case 'round':
          this.line.strokeLinecap = 'round';
          this.line.strokeLinejoin = 'round';
          break;
        case 'angle':
          this.line.strokeLinecap = 'square';
          this.line.strokeLinejoin = 'miter';
          break;
        case 'marker':
          this.line.markerVisibility = 'visible';
          break;
      }
    }
  }

  /// Selection du style de motife pour le dasharray
  selectStyleMotif(): void {
    if (this.line) {
      switch (this.rectStyleMotif.value) {
        case 'largeDasharray':
          this.line.strokeDasharray = `${this.strokeWidth.value * 2}`;
          break;
        case 'smallDasharray':
          this.line.strokeDasharray = `${1}px ${this.strokeWidth.value * 1.5}`;
          break;
      }
    }
  }
}
