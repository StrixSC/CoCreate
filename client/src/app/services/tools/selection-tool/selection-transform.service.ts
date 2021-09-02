import { Injectable } from '@angular/core';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { SelectionCommandConstants } from './command-type-constant';
import { ResizeSelectionService } from './resize-command/resize-selection.service';
import { RotateSelectionService } from './rotate-command/rotate-selection.service';
import { RotateTranslateCompositeCommand } from './rotate-translate-composite-command/rotate-translate-composite-command';
import { TranslateSelectionService } from './translate-command/translate-selection.service';

@Injectable({
  providedIn: 'root',
})
export class SelectionTransformService {
  private commandType: number;

  private rotateTranslateComposite: RotateTranslateCompositeCommand;

  constructor(
    private resizeSelectionService: ResizeSelectionService,
    private rotateSelectionService: RotateSelectionService,
    private translateSelectionService: TranslateSelectionService,
  ) {
    this.rotateTranslateComposite = new RotateTranslateCompositeCommand();
  }

  setCtrlPointList(ctrlPointList: SVGRectElement[]): void {
    this.resizeSelectionService.setCtrlPointList(ctrlPointList);
    this.rotateSelectionService.setCtrlPointList(ctrlPointList);
  }

  createCommand(
    type: number, recSelection: SVGPolygonElement, objectList: SVGElement[],
    offset: Point = { x: 0, y: 0 }, ctrlPoint: SVGRectElement | null = null,
  ): void {
    this.commandType = type;
    switch (type) {
      case SelectionCommandConstants.RESIZE: {
        this.resizeSelectionService.createResizeCommand(recSelection, objectList, offset, ctrlPoint);
        break;
      }
      case SelectionCommandConstants.ROTATE: {
        this.rotateTranslateComposite.addSubCommand(this.rotateSelectionService.createRotateCommand(recSelection, objectList));
        break;
      }
      case SelectionCommandConstants.TRANSLATE: {
        this.rotateTranslateComposite.addSubCommand(this.translateSelectionService.createTranslateCommand(objectList));
        break;
      }
    }
  }

  endCommand(): void {
    switch (this.commandType) {
      case SelectionCommandConstants.RESIZE: {
        this.resizeSelectionService.endCommand();
        break;
      }
      case SelectionCommandConstants.ROTATE: {
        this.rotateSelectionService.endCommand();
        break;
      }
      case SelectionCommandConstants.TRANSLATE: {
        this.translateSelectionService.endCommand();
        break;
      }
    }
    this.rotateTranslateComposite = new RotateTranslateCompositeCommand();
    this.commandType = SelectionCommandConstants.NONE;
  }

  setCommandType(type: number): void {
    this.commandType = type;
  }

  setAlt(value: boolean): void {
    this.resizeSelectionService.isAlt = value;
    this.rotateSelectionService.isAlt = value;
  }

  setShift(value: boolean): void {
    this.resizeSelectionService.isShift = value;
    this.rotateSelectionService.isShift = value;
  }

  hasCommand(): boolean {
    return this.resizeSelectionService.hasCommand() || this.rotateTranslateComposite.hasSubCommand();
  }

  getCommandType(): number {
    return this.commandType;
  }

  getCommand(): ICommand {
    switch (this.commandType) {
      case SelectionCommandConstants.RESIZE: {
        return this.resizeSelectionService.getCommand();
      }
      default: {
        return this.rotateTranslateComposite;
      }
    }
  }

  resize(deltaX: number, deltaY: number, offset: Point): void {
    this.resizeSelectionService.resize(deltaX, deltaY, offset);
  }

  resizeWithLastOffset(): void {
    this.resizeSelectionService.resizeWithLastOffset();
  }

  rotate(side: number, rectSelection: SVGPolygonElement): void {
    this.rotateSelectionService.rotate(side, rectSelection);
  }

  translate(deltaX: number, deltaY: number): void {
    this.translateSelectionService.translate(deltaX, deltaY);
  }
}
