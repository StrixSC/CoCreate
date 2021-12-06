import { v4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/storage';
import { ExportService } from 'src/app/services/export/export.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { Point } from './../model/point.model';
import { DeleteSyncCommand } from './sync/delete-sync-command';
import { ResizeSyncCommand } from './sync/resize-sync-command';
import { RotateSyncCommand } from './sync/rotate-sync-command';
import { RectangleSyncCommand } from './sync/rectangle-sync-command';
import { TranslateSyncCommand } from './sync/translate-sync-command';
import { EllipseSyncCommand } from './sync/ellipse-sync-command';
import { SyncDrawingService } from './syncdrawing.service';
import { FreedrawSyncCommand } from './sync/freedraw-sync-command';
import { ICollaborationLoadResponse } from 'src/app/model/ICollaboration.model';
import { hexToRgb } from './../utils/colors';
import { ActionType, IDeleteAction, ShapeType } from 'src/app/model/IAction.model';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction, IFreedrawUpLoadAction, IShapeAction, ITranslateAction, IFreedrawUpAction, DrawingState, IRotateAction, IResizeAction } from './../model/IAction.model';
import { ToolFactoryService } from './tool-factory.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingLoadService {
  private callbacks: Record<ActionType, (payload: IAction) => any> = {
    Freedraw: (payload: IFreedrawUpAction & IFreedrawUpLoadAction) => {
      try {
        payload.offsets = JSON.parse(payload.offsets);
      } catch (e) {
        return;
      }
      const command = new FreedrawSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Shape: (payload: IShapeAction) => {
      if (payload.shapeType === ShapeType.Ellipse) {
        const command = new EllipseSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
        command.isFlatAction = true;
        command.execute();
      } else if (payload.shapeType === ShapeType.Rectangle) {
        const command = new RectangleSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
        command.isFlatAction = true;
        command.execute();
      }
    },
    Select: () => { },
    Translate: (payload: ITranslateAction) => {
      payload.state = DrawingState.move;
      const command = new TranslateSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Rotate: (payload: IRotateAction) => {
      payload.state = DrawingState.move;
      payload.angle = payload.angle * 180 / Math.PI
      const command = new RotateSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Delete: (payload: IDeleteAction) => {
      const command = new DeleteSyncCommand(payload, this.drawingService, null);
      command.execute();
    },
    Resize: (payload: IResizeAction) => {
      payload.state = DrawingState.move;
      const command = new ResizeSyncCommand(payload, this.drawingService.renderer, this.drawingService, this.syncService);
      command.isFlatAction = true;
      command.execute();
    },
    Text: () => { },
    Layer: () => { },
    UndoRedo: () => { },
  }

  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(
    private toolFactoryService: ToolFactoryService,
    private drawingService: DrawingService,
    private storage: AngularFireStorage,
    private syncService: SyncDrawingService,
    private exportService: ExportService,
    private selectionService: SelectionToolService,
  ) { }

  loadDrawing(): void {
    if (this.activeDrawingData) {
      const convertedHex = hexToRgb(this.activeDrawingData.backgroundColor);
      if (!convertedHex) {
        this.drawingService.newDrawing(1280, 752, {
          rgb: { r: 255, g: 255, b: 255 },
          a: 1,
        });
      } else {
        this.drawingService.newDrawing(1280, 752, {
          rgb: { r: convertedHex.r, g: convertedHex.g, b: convertedHex.b },
          a: 1
        });
      }

    }
  }

  unload(): void {
    this.exportThumbnail();
    this.drawingService.deleteDrawing();
    this.toolFactoryService.deleteAll();
    this.isLoaded = false;
    this.isLoading = false;
  }

  loadActions(): void {
    if (this.drawingService.isCreated && this.activeDrawingData) {
      for (let action of this.activeDrawingData.actions) {
        this.callbacks[action.actionType](action);
      }

      for (let action of this.pendingActions) {
        this.toolFactoryService.handleEvent(action);
      }

    }
    this.isLoading = false;
    this.isLoaded = true;
    setTimeout(() => {
      this.exportThumbnail();
    })
  }

  async exportThumbnail(): Promise<void> {
    if (!this.isLoaded || (!this.activeDrawingData && !this.activeDrawingData!.collaborationId) || !this.drawingService.isCreated) {
      return;
    }

    try {
      this.selectionService.hideSelection();
      const data = this.exportService.exportToFormat("JPG");
      this.selectionService.showSelection();
      const ref = this.storage.ref('/public/' + v4() + '.svg');
      ref.put(data, {
        contentType: "image/svg+xml;charset=utf-8"
      }).then(() => {
        ref.getDownloadURL().toPromise().then((url) => {
          this.syncService.sendThumbnail({ collaborationId: this.activeDrawingData!.collaborationId, url: url })
        })
      });
    } catch (e) {
      return;
    }
  }

}
