import { MatSnackBar } from '@angular/material';
import { DrawingState } from 'src/app/model/IAction.model';
import { CollaborationService } from 'src/app/services/collaboration.service';
import { SyncDrawingService } from './../../syncdrawing.service';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { Tools } from '../../../interfaces/tools.interface';
import { DrawingService } from '../../drawing/drawing.service';
import { MagnetismService } from '../../magnetism/magnetism.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { GridService } from '../grid-tool/grid.service';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SelectionCommandConstants } from './command-type-constant';
import { SelectionTransformService } from './selection-transform.service';

export enum SelectionActionTypes {
  Translate,
  Rotate,
  Resize,
  None
}

@Injectable({
  providedIn: 'root',
})
export class SelectionToolService implements Tools {

  readonly id: number = ToolIdConstants.SELECTION_ID;
  readonly faIcon: IconDefinition = faMousePointer;
  readonly toolName = 'Sélection';
  parameters: FormGroup;

  private hasSelectedItems = false;
  private isAlt = false;
  private isShift = false;
  private shiftChanged = false;

  private pointsSideLength = 10;
  private pointsList: Point[] = [
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ];
  private elementCenterPoint: Point;
  private activeActionType = SelectionActionTypes.None;
  private ctrlPoints: SVGRectElement[] = [];
  private ctrlG: SVGGElement;
  private rectSelection: SVGPolygonElement;

  private rectInversement: SVGRectElement;
  // private firstInvObj: SVGElement | null;
  private recStrokeWidth = 1;

  private objects: SVGElement[] = [];
  private tmpX: number;
  private tmpY: number;
  private wasMoved = false;
  private isIn = false;
  public selectedActionId: string = "";
  private allowMove: boolean = false;
  private firstMovementMagnetism: boolean;

  constructor(
    private snackBar: MatSnackBar,
    private drawingService: DrawingService,
    private offsetManager: OffsetManagerService,
    private rendererService: RendererProviderService,
    private selectionTransformService: SelectionTransformService,
    private syncService: SyncDrawingService,
    private collaborationService: CollaborationService,
  ) {
    this.setRectInversement();
    this.setRectSelection();
    this.setCtrlPoints();

    this.rotationAction = this.rotationAction.bind(this);
  }

  /// Quand le bouton gauche de la sourie est enfoncé, soit on selectionne un objet, soit on debute une zone de selection
  /// soit on s'aprete a deplacer un ou plusieurs objet ou soit on enleve une selection.
  /// Avec le bouton droit, on debute une zone d'inversion.
  onPressed(event: MouseEvent): void {
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      this.tmpX = offset.x;
      this.tmpY = offset.y;
      this.firstMovementMagnetism = true;
      let target = event.target as SVGElement;
      if (this.ctrlPoints.includes(target as SVGRectElement)) {
        this.selectionTransformService.createCommand(
          SelectionCommandConstants.RESIZE, this.rectSelection, this.objects, offset, target as SVGRectElement,
        );
        return;
      }

      const actionId = target.getAttribute('actionId');
      if (event.button === LEFT_CLICK) {
        if (actionId) {
          const obj = this.drawingService.getObjectByActionId(actionId);
          if (obj) {
            const userId = obj.getAttribute('userId');
            if (userId) {
              const isSelected = this.collaborationService.getSelectionStatus(userId, actionId);
              const isSelectedByMe = this.collaborationService.isSelectedByUser(userId, actionId, this.syncService.defaultPayload!.userId);
              if (!isSelected || isSelectedByMe) {
                this.objects = [];
                this.allowMove = true;
                this.selectedActionId = actionId;
                this.objects.push(obj);
              } else {
                this.snackBar.open('Cet élement est déjà sélectionné par un autre utilisateur.', '', { duration: 1000 });
              }
            }
          }
        }

        if (!this.allowMove) {
          if (this.selectedActionId !== "") {
            this.syncService.sendSelect(this.selectedActionId, false);
          }
          this.removeSelection();
          this.selectionTransformService.endCommand();
          return;
        }

        if (this.isInside(offset.x, offset.y)) {
          this.isIn = true;
          this.setMouseWheelEvent();
          if (!this.selectionTransformService.hasCommand()) {
            this.selectionTransformService.setCommandType(SelectionCommandConstants.NONE);
          }
        } else {
          this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectInversement);
          this.wasMoved = true;
        }
      }
    }
  }

  /// Quand le bouton de la sourie gauche est relache, soit on selectionne un objet, soit on termine une zone de selection
  /// et on recherche les objets a l'interieur. Avec le droit, on termine la zone d'inversement et on inverse
  /// la selection des objets se situant a l'interieur.
  onRelease(event: MouseEvent): ICommand | void {
    if (!this.allowMove) return;
    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      if (this.objects.length > 0) {
        this.syncService.sendSelect(this.selectedActionId, true);
        this.allowMove = false;
      }
      this.removeInversement();
      this.isIn = false;
      this.shiftChanged = false;
      let returnRectangleCommand;
      if (this.wasMoved) {
        if (this.selectionTransformService.hasCommand() || this.activeActionType !== SelectionActionTypes.None) {
          returnRectangleCommand = this.selectionTransformService.getCommand();
          const commandType = this.selectionTransformService.getCommandType();
          if (this.activeActionType === SelectionActionTypes.Translate) {
            this.syncService.sendTranslate(DrawingState.up, this.selectedActionId, event.offsetX, event.offsetY);
          } else if (commandType === SelectionCommandConstants.ROTATE) {

          } else if (commandType === SelectionCommandConstants.RESIZE) {

          }

          this.selectionTransformService.endCommand();
        }
        this.wasMoved = false;

        this.endRotation();
        return returnRectangleCommand;
      }

      this.endRotation();
      this.selectionTransformService.endCommand();
    }
  }

  onMove(event: MouseEvent): void {
    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    if (this.drawingService.drawing) {
      if (event.buttons === 1) {
        this.wasMoved = true;
        if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
          this.selectionTransformService.resize(event.movementX, event.movementY, offset);
          this.setSelection();
          return;
        } else if (this.isIn) {
          this.syncService.sendTranslate(DrawingState.move, this.selectedActionId, event.movementX, event.movementY);
          this.activeActionType = SelectionActionTypes.Translate;
          this.setSelection();
        }
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
  }

  onKeyUp(event: KeyboardEvent): void {
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  /// Methode qui calcule la surface que le rectangle de selection doit prendre en fonction des objets selectionnes.
  private setSelection(): void {
    if (this.hasSelection()) {
      this.hasSelectedItems = true;
      if (this.objects[0] !== undefined) {
        this.rendererService.renderer.setProperty(this.objects[0], 'isSelected', true);
      }
      this.rendererService.renderer.setAttribute(this.rectSelection, 'transform', ``);
      this.ctrlPoints.forEach((point) => {
        this.rendererService.renderer.setAttribute(point, 'transform', '');
      });

      let boundingRect = this.objects[0].getBoundingClientRect();

      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      let objStrokeWidth = 0;
      if (this.objects[0].style.stroke !== 'none') {
        objStrokeWidth = this.strToNum(this.objects[0].style.strokeWidth);
      }
      let markerID: string | null = this.objects[0].getAttribute('marker-start');
      if (markerID) {
        objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
      }

      if (this.objects.length === 1 || !this.wasMoved) {
        x = boundingRect.left - this.xFactor() - objStrokeWidth / 2;
        y = boundingRect.top - objStrokeWidth / 2;
        width = boundingRect.width + objStrokeWidth;
        height = boundingRect.height + objStrokeWidth;
      } else {
        let xL = boundingRect.left - objStrokeWidth / 2;
        let xR = boundingRect.right + objStrokeWidth / 2;

        let yT = boundingRect.top - objStrokeWidth / 2;
        let yB = boundingRect.bottom + objStrokeWidth / 2;

        this.objects.forEach((elm) => {
          let value;
          boundingRect = elm.getBoundingClientRect();

          objStrokeWidth = 0;
          if (elm.style.stroke !== 'none') {
            objStrokeWidth = this.strToNum(elm.style.strokeWidth);
          }
          markerID = elm.getAttribute('marker-start');
          if (markerID) {
            objStrokeWidth = Number(markerID.substring(5, markerID.indexOf('-')));
          }

          value = boundingRect.left - objStrokeWidth / 2;
          if (value < xL) {
            xL = value;
          }

          value = boundingRect.right + objStrokeWidth / 2;
          if (value > xR) {
            xR = value;
          }

          value = boundingRect.top - objStrokeWidth / 2;
          if (value < yT) {
            yT = value;
          }

          value = boundingRect.bottom + objStrokeWidth / 2;
          if (value > yB) {
            yB = value;
          }
        });

        x = xL - this.xFactor();
        y = yT;
        width = xR - xL;
        height = yB - yT;
      }

      this.pointsList[0].x = x; this.pointsList[0].y = y;
      this.pointsList[1].x = x + width / 2; this.pointsList[1].y = y;
      this.pointsList[2].x = x + width; this.pointsList[2].y = y;
      this.pointsList[3].x = x + width; this.pointsList[3].y = y + height / 2;
      this.pointsList[4].x = x + width; this.pointsList[4].y = y + height;
      this.pointsList[5].x = x + width / 2; this.pointsList[5].y = y + height;
      this.pointsList[6].x = x; this.pointsList[6].y = y + height;
      this.pointsList[7].x = x; this.pointsList[7].y = y + height / 2;
      this.elementCenterPoint = { x: (x + width / 2), y: (y + height / 2) };

      this.rendererService.renderer.setAttribute(this.rectSelection, 'points', this.pointsToString());
      for (let i = 0; i < 8; i++) {
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'x', `${this.pointsList[i].x + 0.5 - this.pointsSideLength / 2}`);
        this.rendererService.renderer.setAttribute(this.ctrlPoints[i], 'y', `${this.pointsList[i].y + 0.5 - this.pointsSideLength / 2}`);
      }

    } else { return; }
  }

  removeSelection(): void {
    if (this.objects[0] !== undefined) {
      this.rendererService.renderer.setProperty(this.objects[0], 'isSelected', false);
    }
    this.objects = [];
    this.hasSelectedItems = false;

    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectSelection);
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.ctrlG);

    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
  }

  /// Methode pour cacher la selection en gardant en memoire les element
  hideSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'hidden');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'hidden');
  }

  // Rendre la selection visible
  showSelection(): void {
    this.rendererService.renderer.setAttribute(this.ctrlG, 'visibility', 'visible');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'visibility', 'visible');

  }

  /// Methode qui suprime le rectangle de selection du dessin.
  private removeInversement(): void {
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.rectInversement);

    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'width', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'height', '0');
  }

  /// Initialise le rectangle de selection.
  private setRectSelection(): void {
    this.rectSelection = this.rendererService.renderer.createElement('polygon', 'svg');
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke', `rgba(0, 0, 200, 1)`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectSelection, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectSelection, 'points', '');
    this.rendererService.renderer.setAttribute(this.rectSelection, 'pointer-events', 'none');
  }

  /// Initialise les points de controle.
  private setCtrlPoints(): void {
    this.ctrlG = this.rendererService.renderer.createElement('g', 'svg');

    for (let i = 0; i < 8; i++) {
      const point = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setStyle(point, 'stroke', `black`);
      this.rendererService.renderer.setStyle(point, 'stroke-width', `1`);
      this.rendererService.renderer.setStyle(point, 'fill', `white`);

      this.rendererService.renderer.setAttribute(point, 'width', `${this.pointsSideLength}`);
      this.rendererService.renderer.setAttribute(point, 'height', `${this.pointsSideLength}`);

      this.ctrlPoints.push(point);

      this.rendererService.renderer.appendChild(this.ctrlG, point);
    }

    this.selectionTransformService.setCtrlPointList(this.ctrlPoints);
  }

  /// Initialise le rectangle d'inversement.
  private setRectInversement(): void {
    this.rectInversement = this.rendererService.renderer.createElement('rect', 'svg');
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke', `rgba(200, 0, 0, 1)`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-width', `${this.recStrokeWidth}`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'stroke-dasharray', `10,10`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'd', `M5 40 l215 0`);
    this.rendererService.renderer.setStyle(this.rectInversement, 'fill', `none`);
    this.rendererService.renderer.setAttribute(this.rectInversement, 'x', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'y', '0');
    this.rendererService.renderer.setAttribute(this.rectInversement, 'pointer-events', 'none');
  }

  private setMouseWheelEvent(): void {
    window.addEventListener('wheel', this.rotationAction);
  }

  private rotationAction(event: WheelEvent): void {
    if (this.selectionTransformService.getCommandType() !== SelectionCommandConstants.ROTATE || this.shiftChanged) {
      this.selectionTransformService.createCommand(SelectionCommandConstants.ROTATE, this.rectSelection, this.objects);
      this.shiftChanged = false;
    }
    if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.ROTATE) {
      event.preventDefault();
      this.wasMoved = true;

      this.selectionTransformService.rotate(event.deltaY > 0 ? 1 : -1, this.rectSelection);

      if (this.isShift) {
        this.setSelection();
      }
    }
  }

  private endRotation(): void {
    window.removeEventListener('wheel', this.rotationAction);
  }

  /// Retourne la liste d'objets selectionne.
  getObjectList(): SVGElement[] {
    return this.objects;
  }

  /// Retourne la position superieur gauche du rectangle de selection.
  getRectSelectionOffset(): Point {
    return this.pointsList[0];
  }

  /// Retourne si il y a une selection ou non.
  hasSelection(): boolean {
    return this.objects.length === 1;
  }

  /// Selectionne tous les objets du dessin.
  selectAll(): void {
    this.removeSelection();
    this.drawingService.getObjectList().forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  selectByActionId(actionId: string) {
    const obj = this.drawingService.getObjectByActionId(actionId);
    if (!obj) return;
    this.selectedActionId = obj.getAttribute('actionId')!;
    this.setNewSelection([obj]);
  }

  /// Applique une selection sur une liste d'objets fourni.
  setNewSelection(newSelectionList: SVGElement[]): void {
    this.removeSelection();
    newSelectionList.forEach((value) => {
      if (value.tagName.toLowerCase() !== 'defs') {
        this.objects.push(value);
      }
    });
    if (this.objects.length > 0) {
      this.wasMoved = true;
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.rectSelection);
      this.rendererService.renderer.appendChild(this.drawingService.drawing, this.ctrlG);
      this.setSelection();
    }
  }

  setSelectionWidth(): void {
    this.objects[0].style.strokeWidth = '100px';
    this.setNewSelection(this.objects);
  }

  /// Verifie si le curseur se situe a l'interieur de la selection.
  private isInside(x: number, y: number): boolean {
    const rectBox = this.rectSelection.getBoundingClientRect();
    return x >= rectBox.left - this.xFactor() && x <= rectBox.right - this.xFactor() && y >= rectBox.top && y <= rectBox.bottom;
  }

  /// Transforme les chiffre en string suivie de 'px' en number.
  private strToNum(str: string | null): number {
    return str ? +str.replace(/[^-?\d]+/g, ',').split(',').filter((el) => el !== '') : 0;
  }

  /// Transforme la liste de points de controle en un string.
  private pointsToString(): string {
    let pointsStr = '';
    this.pointsList.forEach((point) => {
      pointsStr += `${point.x},${point.y} `;
    });
    return pointsStr.substring(0, pointsStr.length - 1);
  }

  /// Retourne le deplacement de la barre de menu.
  private xFactor(): number {
    return (this.drawingService.drawing as SVGSVGElement).getBoundingClientRect().left;
  }
}
