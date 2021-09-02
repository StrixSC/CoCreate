import { Injectable } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';
import { RotateFromCenterCommand } from './rotate-from-center-command';
import { RotateOnItselfCommand } from './rotate-on-itself-command';

@Injectable({
  providedIn: 'root',
})
export class RotateSelectionService {
  private objectList: SVGElement[];

  private rotateFromCenterCommand: RotateFromCenterCommand | null;
  private rotateOnItselfCommand: RotateOnItselfCommand | null;

  private lastRotation: string;

  private oldRectBox: ClientRect;
  private ctrlPointList: SVGRectElement[];

  private xFactor: number;
  private angle = 0;

  isAlt = false;
  isShift = false;

  constructor(
    private rendererService: RendererProviderService,
    private drawingService: DrawingService,
  ) { }

  setCtrlPointList(ctrlPointList: SVGRectElement[]) {
    this.ctrlPointList = ctrlPointList;
  }

  createRotateCommand(recSelection: SVGPolygonElement, objectList: SVGElement[]): ICommand {
    this.angle = 0;
    this.oldRectBox = recSelection.getBoundingClientRect();
    this.objectList = objectList;
    this.xFactor = this.drawingService.drawing.getBoundingClientRect().left;
    this.rotateFromCenterCommand = new RotateFromCenterCommand(this.rendererService.renderer, this.objectList);
    this.rotateOnItselfCommand = new RotateOnItselfCommand(this.rendererService.renderer, this.objectList, this.xFactor);
    return this.isShift ? this.rotateOnItselfCommand : this.rotateFromCenterCommand;
  }

  endCommand(): void {
    this.rotateFromCenterCommand = null;
    this.rotateOnItselfCommand = null;
  }

  hasCommand(): boolean {
    return this.rotateFromCenterCommand && this.rotateOnItselfCommand ? true : false;
  }

  getCommand(): ICommand {
    return this.lastRotation === 'self' ? this.rotateOnItselfCommand as RotateOnItselfCommand :
      this.rotateFromCenterCommand as RotateFromCenterCommand;
  }

  rotate(side: number, rectSelection: SVGPolygonElement): void {
    if (this.rotateFromCenterCommand && this.rotateOnItselfCommand) {
      this.isAlt ? this.angle += side * 1 : this.angle += side * 15;

      if (this.angle >= 360) {
        this.angle -= 360;
      } else if (this.angle < 0) {
        this.angle += 360;
      }

      const xTranslate = this.oldRectBox.left + this.oldRectBox.width / 2 - this.xFactor;
      const yTranslate = this.oldRectBox.top + this.oldRectBox.height / 2;

      if (this.isShift) {
        this.lastRotation = 'self';
        this.rotateOnItselfCommand.rotate(this.angle);
      } else {
        this.lastRotation = 'all';
        this.rotateFromCenterCommand.rotate(this.angle, xTranslate, yTranslate);
        this.rendererService.renderer.setAttribute(rectSelection, 'transform', `rotate(${this.angle} ${xTranslate} ${yTranslate})`);
        this.ctrlPointList.forEach((point) => {
          this.rendererService.renderer.setAttribute(point, 'transform', `rotate(${this.angle} ${xTranslate} ${yTranslate})`);
        });
      }
    }
  }
}
