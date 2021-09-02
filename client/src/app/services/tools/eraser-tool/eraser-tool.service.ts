import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { EraserCommand } from './eraser-command';

const TARGET_STROKE_WIDTH = 5;

/// Service de gestion de l'outil efface
@Injectable({
  providedIn: 'root',
})
export class EraserToolService implements Tools {
  readonly id: number = ToolIdConstants.ERASER_ID;
  readonly faIcon: IconDefinition = faEraser;
  readonly toolName = 'Outil Efface';
  parameters: FormGroup;
  private eraserSize: FormControl;
  eraser: SVGRectElement;
  private isPressed = false;
  private isEraserActive = false;
  private itemToDelete: Map<string, SVGElement> = new Map<string, SVGElement>();
  private deleteMarkList: SVGElement[] = [];
  private deleteableList: SVGElement[] = [];
  private lastOffsetRegistered: Point = { x: 0, y: 0 };

  constructor(
    private drawingService: DrawingService,
    private offsetManager: OffsetManagerService,
    private rendererService: RendererProviderService,
    private commandInvoker: CommandInvokerService,
  ) {
    this.eraserSize = new FormControl(1, [Validators.min(1), Validators.required]);
    this.parameters = new FormGroup({ eraserSize: this.eraserSize, });
    this.createEraser();
    this.eraserSize.valueChanges.subscribe((value) => {
      this.rendererService.renderer.setAttribute(this.eraser, 'width', `${this.eraserSize.value}px`);
      this.rendererService.renderer.setAttribute(this.eraser, 'height', `${this.eraserSize.value}px`);
      this.moveEraser(this.lastOffsetRegistered);
    });
    this.commandInvoker.commandCallEmitter.subscribe(() => {
      if (this.isEraserActive) {
        this.reset();
        this.processElementInEraser();
      }
    });
  }

  /// Construit l'efface qui sera utiliser par la suite
  private createEraser() {
    this.eraser = this.rendererService.renderer.createElement('rect', 'svg');
    this.rendererService.renderer.setAttribute(this.eraser, 'name', `eraser`);
    this.rendererService.renderer.setAttribute(this.eraser, 'width', `${this.eraserSize.value}px`);
    this.rendererService.renderer.setAttribute(this.eraser, 'height', `${this.eraserSize.value}px`);
    this.rendererService.renderer.setStyle(this.eraser, 'fill', 'rgb(255,255,255)');
    this.rendererService.renderer.setStyle(this.eraser, 'fill-opacity', '0.8');
    this.rendererService.renderer.setStyle(this.eraser, 'stroke-width', '1px');
    this.rendererService.renderer.setStyle(this.eraser, 'stroke', 'rgb(0,0,0)');
    this.rendererService.renderer.setStyle(this.eraser, 'cursor', 'none');
    this.rendererService.renderer.setAttribute(this.eraser, 'pointer-events', 'none');
    this.moveEraser(this.lastOffsetRegistered);
  }

  /// Deplace l'efface
  private moveEraser(offset: Point) {
    this.lastOffsetRegistered = offset;
    this.rendererService.renderer.setAttribute(this.eraser, 'x', `${offset.x - this.eraserSize.value / 2}px`);
    this.rendererService.renderer.setAttribute(this.eraser, 'y', `${offset.y - this.eraserSize.value / 2}px`);
  }

  /// Gere l'ajout de liste d'element a supprimer
  onPressed(event: MouseEvent): void {
    if (this.isEraserActive) {
      const offset: Point = this.offsetManager.offsetFromMouseEvent(event);
      this.moveEraser(offset);
      if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
        this.isPressed = true;
        this.processElementInEraser();
      }
    }
  }

  /// Si il y a des element de selectionner une commande est generer
  onRelease(event: MouseEvent): void | ICommand {
    if (this.isPressed && this.isEraserActive && this.itemToDelete.size > 0) {
      const eraserCommand = new EraserCommand(this.itemToDelete, this.drawingService);
      eraserCommand.execute();
      this.reset();
      this.processElementInEraser();
      return eraserCommand;
    }
    return;
  }

  /// Gestion de capture des objets lors du mouvements de la souris
  onMove(event: MouseEvent): void {
    if (this.isEraserActive) {
      const offset: Point = this.offsetManager.offsetFromMouseEvent(event);
      this.moveEraser(offset);
      if (this.isPressed) {
        this.processElementInEraser();
      } else {
        const elementInEraser: SVGElement[] = this.getElementsInContact();
        this.deleteMarkList.forEach((el) => {
          this.rendererService.renderer.removeChild(this.drawingService.drawing, el);
        });
        this.deleteMarkList = [];
        elementInEraser.forEach((el) => {
          const elDeleteMark = this.createDeleteMarkElement(el);
          this.rendererService.renderer.appendChild(this.drawingService.drawing, elDeleteMark);
          this.deleteMarkList.push(elDeleteMark);
        });
      }
    }
  }

  /// N'est pas utilisé
  onKeyDown(event: KeyboardEvent): void {
    return;
  }

  /// N'est pas utilisé
  onKeyUp(event: KeyboardEvent): void {
    if (this.isEraserActive) {
      this.updateDeleteableList();
    }
  }

  /// Ajout l'éfface et active les fontion de l'outil
  pickupTool(): void {
    this.isEraserActive = true;
    this.rendererService.renderer.appendChild(this.drawingService.drawing, this.eraser);
    this.isPressed = false;
    this.updateDeleteableList();
  }

  /// Retire l'éfface et désactive les fonctions de l'outil
  dropTool(): void {
    this.isEraserActive = false;
    this.rendererService.renderer.removeChild(this.drawingService.drawing, this.eraser);
    this.reset();
    this.isPressed = false;
  }

  /// Mise à zéros de l'outil
  reset(): void {
    this.isPressed = false;
    this.deleteMarkList.forEach((el) => {
      this.rendererService.renderer.removeChild(this.drawingService.drawing, el);
    });
    this.deleteMarkList = [];
    this.itemToDelete.clear();
    this.updateDeleteableList();
  }

  /// Vérifie les élements en contact et réagis en fonction
  private processElementInEraser(): void {
    const elementInEraser: SVGElement[] = this.getElementsInContact();
    elementInEraser.forEach((el) => {
      if (!this.itemToDelete.get(el.id)) {
        this.itemToDelete.set(el.id, el);
        const elDeleteMark = this.createDeleteMarkElement(el);
        this.rendererService.renderer.appendChild(this.drawingService.drawing, elDeleteMark);
        this.deleteMarkList.push(elDeleteMark);
      }
    });
  }

  /// Récupère les éléments en contact
  private getElementsInContact(): SVGElement[] {
    const elementInContact: SVGElement[] = [];
    const eraserBox = this.eraser.getBoundingClientRect();
    this.deleteableList.forEach((el) => {
      const elementBox = el.getBoundingClientRect();
      if (this.isElementInContact(eraserBox, elementBox, this.strToNum(el.style.strokeWidth))) {
        elementInContact.push(el);
      }
    });
    return elementInContact;
  }

  /// Constructeur d'élément indicateur de sélection
  private createDeleteMarkElement(el: SVGElement): SVGElement {

    let deleteMark: SVGElement;
    if (el.tagName === 'g' || el.tagName === 'text' || el.tagName === 'image') {
      const elBox = el.getBoundingClientRect();
      deleteMark = this.rendererService.renderer.createElement('rect', 'svg');
      this.rendererService.renderer.setAttribute(deleteMark, 'width', `${elBox.width}px`);
      this.rendererService.renderer.setAttribute(deleteMark, 'height', `${elBox.height}px`);
      this.rendererService.renderer.setAttribute(deleteMark, 'x',
        `${elBox.left - this.drawingService.drawing.getBoundingClientRect().left}px`);
      this.rendererService.renderer.setAttribute(deleteMark, 'y', `${elBox.top}px`);
    } else {
      deleteMark = el.cloneNode() as SVGElement;
    }
    this.rendererService.renderer.setAttribute(deleteMark, 'id', `${el.id}-delete`);
    this.rendererService.renderer.setStyle(deleteMark, 'strokeWidth', `${this.strToNum(el.style.strokeWidth) + TARGET_STROKE_WIDTH}`);
    this.rendererService.renderer.setStyle(deleteMark, 'fill', 'none');
    this.rendererService.renderer.setStyle(deleteMark, 'stroke', 'red');
    this.rendererService.renderer.setAttribute(deleteMark, 'pointer-events', 'none');
    return deleteMark;
  }

  /// Construit une liste avec juste les items visibles
  private updateDeleteableList() {
    this.deleteableList = [];
    let isCovered = false;
    this.drawingService.getObjectList().forEach((lowerEl, lowerId) => {
      isCovered = false;
      const lowerElStrokeWidth = this.strToNum(lowerEl.style.strokeWidth);
      const lowerElBoundingBox = lowerEl.getBoundingClientRect();
      for (const pairHigherEl of this.drawingService.getObjectList()) {
        if (pairHigherEl[0] > lowerId) {
          if (this.isElementCompletelyUnder(
            pairHigherEl[1].getBoundingClientRect(), this.strToNum(pairHigherEl[1].style.strokeWidth),
            lowerElBoundingBox, lowerElStrokeWidth,
          )) {
            isCovered = true;
          }
        }
      }
      if (!isCovered) {
        this.deleteableList.push(lowerEl);
      }
    });
  }

  /// Vérifie si un item est contenu dans un autre
  private isElementCompletelyUnder(
    rect1: ClientRect | DOMRect, rect1StrokeWidth: number, rect2: ClientRect | DOMRect, rect2StrokeWidth: number,
  ): boolean {
    return rect1.left - rect1StrokeWidth < rect2.left + rect2StrokeWidth
      && rect1.right + rect1StrokeWidth > rect2.right - rect2StrokeWidth
      && rect1.top - rect1StrokeWidth < rect2.top + rect2StrokeWidth
      && rect1.bottom + rect1StrokeWidth > rect2.bottom - rect2StrokeWidth;
  }

  /// Vérifie si un élément est en catact avec un autre
  private isElementInContact(rect1: ClientRect | DOMRect, rect2: ClientRect | DOMRect, rect2StrokeWidth: number): boolean {
    return !(
      rect1.left > rect2.right + rect2StrokeWidth
      || rect1.right < rect2.left - rect2StrokeWidth
      || rect1.top > rect2.bottom + rect2StrokeWidth
      || rect1.bottom < rect2.top - rect2StrokeWidth
    );
  }

  private strToNum(str: string | null) {
    return str ? +str.replace(/[^-?\d]+/g, ',').split(',').filter((el) => el !== '') : 0;
  }
}
