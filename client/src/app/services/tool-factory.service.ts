import { CollaborationService } from './collaboration.service';
import { toRGBString, fromAlpha } from './../utils/colors';
import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IDefaultActionPayload, ActionType, IAction, IFreedrawAction, IFreedrawUpAction, DrawingState, IUndoRedoAction } from '../model/IAction.model';
import { Injectable } from '@angular/core';
import { Pencil } from './tools/pencil-tool/pencil.model';
import { PencilCommand } from './tools/pencil-tool/pencil-command';
import { RendererProviderService } from './renderer-provider/renderer-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ToolFactoryService {

  private currentPencilCommand: PencilCommand;

  tools: Record<ActionType, (payload: IAction) => any> = {
    Freedraw: (payload: IDefaultActionPayload & IFreedrawAction & IFreedrawUpAction) => {
      this.collaborationService.addUser(payload.userId);
      this.collaborationService.addActionToUser(payload.userId, { data: payload, command: this.currentPencilCommand, isUndone: false });

      if (payload.state === DrawingState.down) {
        let pencil: Pencil = {} as Pencil;
        pencil.pointsList = [{ x: payload.x, y: payload.y }];
        pencil.fill = 'none';
        pencil.fillOpacity = 'none';
        pencil.stroke = toRGBString([payload.r, payload.g, payload.b]);
        pencil.strokeWidth = payload.width;
        pencil.strokeOpacity = fromAlpha(payload.a);

        this.currentPencilCommand = new PencilCommand(this.renderer.renderer, pencil, this.drawingService);
        this.currentPencilCommand.execute();
      } else if (payload.state === DrawingState.move) {
        this.currentPencilCommand.addPoint({ x: payload.x, y: payload.y });
      }
    },
    Select: () => {
      return;
    },
    Shape: () => {
      return;
    },
    Delete: () => {
      return;
    },
    Translate: () => {
      return;
    },
    Rotate: () => {
      return;
    },
    Resize: () => {
      return;
    },
    UndoRedo: (payload: IDefaultActionPayload & IUndoRedoAction) => {
      if(payload.isUndo) {
        this.collaborationService.undoUserAction(payload.userId, payload.actionId);
      } else {
        this.collaborationService.redoUserAction(payload.userId, payload.actionId);
      }
    },
    Layer: () => {
      return
    },
    Text: () => {

    }
  }

  constructor(private renderer: RendererProviderService, private drawingService: DrawingService, private collaborationService: CollaborationService) { }

  create(payload: IAction): ICommand {
    return this.tools[payload.actionType](payload);
  }
}
