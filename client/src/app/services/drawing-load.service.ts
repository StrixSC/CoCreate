import { FreedrawSyncCommand } from './sync/freedraw-sync-command';
import { toRGBString, fromAlpha } from './../utils/colors';
import { Pencil } from './tools/pencil-tool/pencil.model';
import { PencilCommand } from './tools/pencil-tool/pencil-command';
import { ActionType } from 'src/app/model/IAction.model';
import { ICommand } from 'src/app/interfaces/command.interface';
import { SyncDrawingService } from './syncdrawing.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction, IFreedrawUpLoadAction } from './../model/IAction.model';
import { ToolFactoryService } from './tool-factory.service';
import { ICollaborationLoadResponse } from './../model/ICollaboration.model';
import { Injectable, Renderer2 } from '@angular/core';

class LoadFreedrawCommand {
  command: PencilCommand;

  constructor(public payload: IFreedrawUpLoadAction, private drawingService: DrawingService, private renderer: Renderer2) {
    let pencil: Pencil = {} as Pencil;
    pencil.pointsList = JSON.parse(this.payload.offsets);
    pencil.fill = "none";
    pencil.fillOpacity = "none";
    pencil.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
    pencil.strokeWidth = this.payload.width;
    pencil.strokeOpacity = fromAlpha(this.payload.a);

    this.command = new PencilCommand(this.renderer, pencil, this.drawingService);
  }

  load(): void {
    this.command.execute();
  }
}

@Injectable({
  providedIn: 'root'
})
export class DrawingLoadService {

  private callbacks: Record<ActionType, (payload: IAction) => any> = {
    Freedraw: (payload: IFreedrawUpLoadAction) => {
      // const command = new LoadFreedrawCommand(payload, this.drawingService, this.drawingService.renderer);
      // command.load();
    },
    Shape: () => { },
    Select: () => { },
    Translate: () => { },
    Rotate: () => { },
    Delete: () => { },
    Resize: () => { },
    Text: () => { },
    Layer: () => { },
    UndoRedo: () => { },
  }

  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(private toolFactoryService: ToolFactoryService, private drawingService: DrawingService) { }

  loadDrawing(): void {
    if (this.activeDrawingData) {
      this.drawingService.newDrawing(1280, 752, {
        rgb: { r: 255, g: 255, b: 255 },
        a: 1,
      });

      if (this.drawingService.isCreated) {
        for (let action of this.activeDrawingData.actions) {
          this.callbacks[action.actionType](action);
        }

        for (let action of this.pendingActions) {
          this.toolFactoryService.handleEvent(action);
        }
      }

      this.isLoading = false;
      this.isLoaded = true;

    }
  }

}
