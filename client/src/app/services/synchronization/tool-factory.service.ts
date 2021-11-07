import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IDefaultActionPayload, ActionType, IAction, IFreedrawAction, IFreedrawUpAction, DrawingState } from '../../model/IAction.model';
import { Injectable } from '@angular/core';
import { Pencil } from '../tools/pencil-tool/pencil.model';
import { PencilCommand } from '../tools/pencil-tool/pencil-command';
import { RendererProviderService } from '../renderer-provider/renderer-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ToolFactoryService {

  tools: Record<ActionType, (payload: IAction) => any> = {
    Freedraw: (payload: IDefaultActionPayload & IFreedrawAction & IFreedrawUpAction) => {
      let pencil: Pencil = {} as Pencil;
      pencil.pointsList = payload.offsets;
      pencil.fill = `rgb(${payload.a}, ${payload.g}, ${payload.b})`;
      pencil.fillOpacity = '1.0';
      pencil.stroke = `rgb(${payload.a}, ${payload.g}, ${payload.b})`;
      pencil.strokeWidth = payload.width; 
      pencil.strokeOpacity = '1.0';
      let pencilCommand = new PencilCommand(this.renderer.renderer, pencil, this.drawingService);
      return pencilCommand;
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
    UndoRedo: () => {
      return
    },
    Layer: () => {
      return 
    },
    Text: () => {

    }
  }

  constructor(private renderer: RendererProviderService, private drawingService: DrawingService) { }

  create(payload: IAction): ICommand {
    return this.tools[payload.actionType](payload);
  }
}
