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
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { SelectionCommandConstants } from './command-type-constant';
import { SelectionTransformService } from './selection-transform.service';

const CLOCKWISE = 5;
const COUNTER_CLOCKWISE = -5;

export interface SelectionActionButton {
  iconSrc: string;
  iconSize: number;
  buttonWidth: number;
  buttonGroup: SVGGElement;
  buttonCircle: SVGCircleElement;
  buttonIcon: SVGImageElement;
  stroke: string;
  opacity: string;
  opacityHover: string;
  iconId: string;
}

export enum SelectionActionTypes {
  Translate,
  Rotate,
  Resize,
  None
}

export enum ActionButtonIds {
  ClockwiseRotation = 'clockwiseRotation',
  CounterClockwiseRotation = 'counterClockwiseRotation',
  HoldRotation = 'holdRotation',
  Delete = 'delete'
}

@Injectable({
  providedIn: 'root',
})
export class SelectionToolService implements Tools {

  readonly id: number = ToolIdConstants.SELECTION_ID;
  readonly faIcon: IconDefinition = faMousePointer;
  readonly toolName = 'Sélection';
  readonly DEFAULT_ACTION_BUTTON_WIDTH = 12.5;
  readonly DEFAULT_ACTION_BUTTON_WIDTH_OFFSET = 30;
  readonly DEFAULT_ACTION_BUTTON_HEIGHT_OFFSET = 30;
  readonly DEFAULT_BUTTON_GAP = 3;
  readonly DEFAULT_ANGLE_SHIFT = 30;

  parameters: FormGroup;

  private isShift = false;
  private shiftChanged = false;

  private pointsSideLength = 10;
  private pointsList: Point[] = [
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
  ];

  private activeActionType = SelectionActionTypes.None;
  private ctrlPoints: SVGRectElement[] = [];
  private ctrlG: SVGGElement;
  private rectSelection: SVGPolygonElement;

  // Action Buttons
  private actionButtons: SelectionActionButton[] = [
    {
      buttonWidth: this.DEFAULT_ACTION_BUTTON_WIDTH,
      iconSize: this.DEFAULT_ACTION_BUTTON_WIDTH + 10,
      stroke: 'black',
      opacity: '0.25',
      opacityHover: '0.50',
      iconSrc: 'assets/svg-icon/trash.svg',
      iconId: ActionButtonIds.Delete,
    } as SelectionActionButton,
    {
      buttonWidth: this.DEFAULT_ACTION_BUTTON_WIDTH,
      iconSize: this.DEFAULT_ACTION_BUTTON_WIDTH + 2.5,
      stroke: 'black',
      opacity: '0.25',
      opacityHover: '0.50',
      iconSrc: 'assets/svg-icon/arrow.svg',
      iconId: ActionButtonIds.HoldRotation,
    } as SelectionActionButton
  ];
  private actionButtonGroup: SVGGElement;
  private rectInversement: SVGRectElement;
  private recStrokeWidth = 1;

  public activeAngle: number = 0;

  private objects: SVGElement[] = [];
  private wasMoved = false;
  private isIn = false;
  public selectedActionId: string = "";
  private allowMove: boolean = false;
  private isRotating: boolean = false;

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
    if (this.hasSelection()) {
      const id = (event.target as SVGElement).getAttribute('iconId');
      if (id) {
        const button = this.actionButtons.find((b) => b.iconId === id);
        if (button) {
          if (button.iconId === ActionButtonIds.ClockwiseRotation) {
            this.rotateClockwiseIncrementally();
            this.setSelection();
          } else if (button.iconId === ActionButtonIds.CounterClockwiseRotation) {
            this.rotateCounterClockwiseIncrementally();
            this.setSelection();
          } else if (button.iconId === ActionButtonIds.Delete) {
            this.syncService.sendDelete(this.selectedActionId);
            this.removeSelection();
          } else if (button.iconId === ActionButtonIds.HoldRotation) {
            this.isRotating = true;
            this.setSelection();
          }
          return;
        }
      }
    }

    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
      let target = event.target as SVGElement;

      if (this.ctrlPoints.includes(target as SVGRectElement)) {
        this.selectionTransformService.createCommand(
          SelectionCommandConstants.RESIZE, this.rectSelection, this.objects, offset, target as SVGRectElement,
        );
        this.syncService.sendResize(DrawingState.down, this.selectedActionId, 1, 1, 0, 0);
        this.allowMove = true;
        this.activeActionType = SelectionActionTypes.Resize;
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
                this.objects.push(obj);
                if (this.selectedActionId !== actionId) {
                  this.syncService.sendSelect(this.selectedActionId, false);
                  this.selectedActionId = actionId
                }
                this.syncService.sendSelect(this.selectedActionId, true);
                this.setSelection();
                this.isIn = true;
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

    if (this.isRotating) {
      this.isRotating = false;
      this.syncService.sendRotate(DrawingState.up, this.selectedActionId, 0);
      this.activeActionType = SelectionActionTypes.None;
      this.removeMouseWheelEvent();
      return;
    }

    if (!this.allowMove) return;

    if ((event.button === RIGHT_CLICK || event.button === LEFT_CLICK) && this.drawingService.drawing) {
      if (this.objects.length > 0) {
        this.syncService.sendSelect(this.selectedActionId, true);
        this.allowMove = false;
      }
      this.removeInversement();
      this.isIn = false;
      this.shiftChanged = false;
      this.wasMoved = false;
      if (this.activeActionType === SelectionActionTypes.Translate) {
        this.syncService.sendTranslate(DrawingState.up, this.selectedActionId, 0, 0, false);
      } else if (this.activeActionType === SelectionActionTypes.Resize) {
        this.syncService.sendResize(DrawingState.up, this.selectedActionId, 1, 1, 0, 0, false);
      }

      this.selectionTransformService.endCommand();
    }
  }

  hoverActionButton(id: string) {
    const button = this.actionButtons.find((button) => button.iconId === id);
    button!.buttonCircle.setAttribute('opacity', button!.opacityHover);
  }

  unhoverActionButton() {
    for (let button of this.actionButtons) {
      button.buttonCircle.setAttribute('opacity', button.opacity);
    }
  }

  onMove(event: MouseEvent): void {

    const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
    if (this.isRotating || !this.allowMove || !this.hasSelection()) {
      return;
    }

    if (this.drawingService.drawing) {
      if (event.buttons === 1) {
        this.wasMoved = true;
        if (this.selectionTransformService.getCommandType() === SelectionCommandConstants.RESIZE) {
          this.selectionTransformService.resize(event.movementX, event.movementY, offset);
          this.setSelection();
          return;
        } else if (this.isIn) {
          this.syncService.sendTranslate(DrawingState.move, this.selectedActionId, event.movementX, event.movementY, false);
          this.activeActionType = SelectionActionTypes.Translate;
          this.setSelection();
        }
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  onKeyUp(event: KeyboardEvent): void {
    return;
  }

  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }

  rotateClockwiseIncrementally(): void {
    this.syncService.sendRotate(DrawingState.down, this.selectedActionId, this.DEFAULT_ANGLE_SHIFT);
  }

  rotateCounterClockwiseIncrementally(): void {
    this.syncService.sendRotate(DrawingState.down, this.selectedActionId, -this.DEFAULT_ANGLE_SHIFT);
  }

  rotate(event: WheelEvent): void {
    if (this.isRotating) {
      this.activeActionType = SelectionActionTypes.Rotate;
      const side = event.deltaY > 0 ? CLOCKWISE : COUNTER_CLOCKWISE;
      this.syncService.sendRotate(DrawingState.move, this.selectedActionId, (side * Math.PI / 180));
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /// Methode qui calcule la surface que le rectangle de selection doit prendre en fonction des objets selectionnes.
  public setSelection(): void {
    if (this.hasSelection()) {
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

      this.updateButtons(this.pointsList[1].x, this.pointsList[1].y);
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

    this.setActionButtons();
    this.selectionTransformService.setCtrlPointList(this.ctrlPoints);
  }

  private setActionButtons() {
    this.actionButtonGroup = this.rendererService.renderer.createElement('g', 'svg');
    let width = 0;
    let height = 0;
    for (let button of this.actionButtons) {
      this.createButton(button);
      width += button.buttonWidth;
      height += button.buttonWidth;
      this.rendererService.renderer.appendChild(this.actionButtonGroup, button.buttonGroup);
    }

    this.rendererService.renderer.setAttribute(this.actionButtonGroup, 'width', width.toString());
    this.rendererService.renderer.setAttribute(this.actionButtonGroup, 'height', height.toString());
    this.rendererService.renderer.appendChild(this.ctrlG, this.actionButtonGroup);
  }

  private createButton(button: SelectionActionButton) {
    button.buttonGroup = this.rendererService.renderer.createElement('g', 'svg');
    this.rendererService.renderer.setAttribute(button.buttonGroup, 'width', button.buttonWidth.toString());
    this.rendererService.renderer.setAttribute(button.buttonGroup, 'height', button.buttonWidth.toString());
    this.rendererService.renderer.setAttribute(button.buttonGroup, 'iconId', button.iconId);

    button.buttonCircle = this.rendererService.renderer.createElement('circle', 'svg');
    this.rendererService.renderer.setAttribute(button.buttonCircle, 'r', button.buttonWidth.toString());
    this.rendererService.renderer.setAttribute(button.buttonCircle, 'stroke', button.stroke.toString());
    this.rendererService.renderer.setAttribute(button.buttonCircle, 'opacity', button.opacity.toString());
    this.rendererService.renderer.setAttribute(button.buttonCircle, 'iconId', button.iconId);

    button.buttonIcon = this.rendererService.renderer.createElement('image', 'svg');
    this.rendererService.renderer.setAttribute(button.buttonIcon, 'href', button.iconSrc);
    this.rendererService.renderer.setAttribute(button.buttonIcon, 'width', button.iconSize.toString());
    this.rendererService.renderer.setAttribute(button.buttonIcon, 'height', button.iconSize.toString());
    this.rendererService.renderer.setAttribute(button.buttonIcon, 'iconId', button.iconId);

    this.rendererService.renderer.appendChild(button.buttonGroup, button.buttonCircle);
    this.rendererService.renderer.appendChild(button.buttonGroup, button.buttonIcon);
    this.rendererService.renderer.appendChild(this.ctrlG, button.buttonGroup)
  }

  private updateButtons(x: number, y: number) {
    const buttonCount = this.actionButtons.length;
    const yPos = y - this.DEFAULT_ACTION_BUTTON_HEIGHT_OFFSET;
    for (let i = 0; i < buttonCount; i++) {
      const button = this.actionButtons[i];
      let xPos = x;
      let index = i + 1;
      let buttonWidth = (button.buttonWidth + this.DEFAULT_BUTTON_GAP) * 2;
      const half = Math.round(buttonCount / 2);

      if (index === half) {
        xPos = x;
      } else if (index < half) {
        xPos = x - ((half - index) * buttonWidth);
      } else {
        xPos = x + ((index - half) * buttonWidth);
      }

      if (buttonCount % 2 === 0) {
        xPos -= buttonWidth / 2;
      }

      this.rendererService.renderer.setAttribute(button.buttonGroup, 'x', xPos.toString());
      this.rendererService.renderer.setAttribute(button.buttonGroup, 'y', yPos.toString());
      this.rendererService.renderer.setAttribute(button.buttonCircle, 'cx', xPos.toString());
      this.rendererService.renderer.setAttribute(button.buttonCircle, 'cy', yPos.toString());
      this.rendererService.renderer.setAttribute(button.buttonIcon, 'x', `${xPos - button.iconSize / 2}`);
      this.rendererService.renderer.setAttribute(button.buttonIcon, 'y', `${yPos - button.iconSize / 2}`);
    }
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

  private removeMouseWheelEvent(): void {
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

  selectByActionId(actionId: string, username: string) {
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

  public sendUnselect(actionId?: string): void {
    if (this.hasSelection() && !actionId) {
      this.syncService.sendSelect(this.selectedActionId, false);
      this.removeSelection();
    } else if (actionId) {
      this.syncService.sendSelect(actionId, false);
      this.removeSelection();
    }
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
