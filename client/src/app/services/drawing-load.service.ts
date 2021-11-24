import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction } from './../model/IAction.model';
import { ToolFactoryService } from './tool-factory.service';
import { ActionData } from './collaboration.service';
import { ICollaborationLoadResponse } from './../model/ICollaboration.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingLoadService {

  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(private toolFactoryService: ToolFactoryService, private drawingService: DrawingService) { }

  loadDrawing(): void {
    if (this.activeDrawingData) {
      this.isLoading = true;
      this.drawingService.newDrawing(1280, 752, {
        rgb: { r: 255, g: 255, b: 255 },
        a: 1,
      });

      for (let action of this.activeDrawingData.actions) {
        this.toolFactoryService.handleEvent(action);
      }

      for (let action of this.pendingActions) {
        this.toolFactoryService.handleEvent(action);
      }

      this.isLoading = false;
      this.isLoaded = true;
    }
  }

}
