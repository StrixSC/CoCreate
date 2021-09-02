import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faSprayCan, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_CIRCLERADIUS, INITIAL_DIAMETER, INITIAL_EMISSION, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SprayCommand } from './spray-command';
import { Spray } from './spray.model';

const VALIDATOR_DIAMETER = 1;
const VALIDATOR_EMISSION = 1;
const DELAY = 10; // le delai est en millisecondes
/// Service pour generer des commandes spray et ajuster les parametre de cette dernière
@Injectable({
  providedIn: 'root',
})
export class SprayToolService implements Tools {
  readonly toolName = 'Outil Aérosol';
  readonly faIcon: IconDefinition = faSprayCan;
  readonly id = ToolIdConstants.SPRAY_ID;
  private diameter: FormControl;
  private emissionPerSecond: FormControl;
  private circleRadius: FormControl;
  parameters: FormGroup;
  private sprayCommand: SprayCommand | null;
  private spray: Spray | null;
  private intervalTime: number;
  private offset: Point;
  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService) {
    this.diameter = new FormControl(INITIAL_DIAMETER, Validators.min(VALIDATOR_DIAMETER));
    this.emissionPerSecond = new FormControl(INITIAL_EMISSION, Validators.min(VALIDATOR_EMISSION));
    this.circleRadius = new FormControl(INITIAL_CIRCLERADIUS, Validators.min(VALIDATOR_DIAMETER));
    this.parameters = new FormGroup({
      diameter: this.diameter,
      emissionPerSecond: this.emissionPerSecond,
      circleRadius: this.circleRadius,
    });
  }

  /// Démarage de la création des segments du spray
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.emissionPerSecond.valid && this.diameter.valid) {
        this.spray = {
          pointsList: [],
          radius: this.circleRadius.value,
          fill: 'none',
          stroke: 'none',
          fillOpacity: 'none',
          strokeOpacity: 'none',
        };
        if (event.button === LEFT_CLICK) {
          this.spray.fill = this.colorTool.primaryColorString;
          this.spray.strokeOpacity = this.colorTool.primaryAlpha.toString();
        } else {

          this.spray.fill = this.colorTool.secondaryColorString;
          this.spray.strokeOpacity = this.colorTool.secondaryAlpha.toString();
        }
        this.sprayCommand = new SprayCommand(this.rendererService.renderer, this.spray, this.drawingService);
        this.sprayCommand.execute();
        this.offset = this.offsetManager.offsetFromMouseEvent(event);
        this.intervalTime = window.setInterval((sprayCommandRef: SprayCommand, spray: Spray) => {
          /// Mettre a jour la table des points

          this.updatePoints(spray, this.offset);
          /// Faire afficher les points
          sprayCommandRef.updatePoint();
        }, DELAY, this.sprayCommand, this.spray);
      }
    }
  }

  onRelease(event: MouseEvent): void | ICommand {
    this.spray = null;
    window.clearInterval(this.intervalTime);
    if (this.sprayCommand) {
      // arreter le timer
      const returnPenCommand = this.sprayCommand;
      this.sprayCommand = null;
      return returnPenCommand;
    }
    return;
  }

  /// Ajout de point selon le deplacement de la plume
  onMove(event: MouseEvent): void {
    this.offset = this.offsetManager.offsetFromMouseEvent(event);
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
    window.clearInterval(this.intervalTime);
    return;
  }

  private generatePoints(offset: Point): Point[] {
    const tablePoint: Point[] = [];
    // creer un nombre de points consequent
    let i = 0;
    for (i; i < this.emissionPerSecond.value; i++) {
      // determiner l'angle aleatoire compris entre 0 et 2pi
      const angle = Math.random() * 2 * Math.PI;
      // determiner le rayon aleatoire compris entre 0 et le rayon max
      const radius = Math.random() * this.diameter.value / 2;
      // calculer la position en  fonction de l'angle et du rayon
      const newPoint = ({ x: radius * Math.cos(angle) + offset.x, y: radius * Math.sin(angle) + offset.y });
      // ajouter le point au tableau de point de l'objet
      tablePoint.push(newPoint);
    }
    return tablePoint;
  }

  private updatePoints(spray: Spray, point: Point): void {
    spray.pointsList = this.generatePoints(point);
  }
}
