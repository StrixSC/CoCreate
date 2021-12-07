import { CollaborationService } from 'src/app/services/collaboration.service';
import { v4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/storage';
import { ExportService } from 'src/app/services/export/export.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { SyncDrawingService } from './syncdrawing.service';
import { ICollaborationLoadResponse } from 'src/app/model/ICollaboration.model';
import { hexToRgb } from './../utils/colors';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IAction } from './../model/IAction.model';
import { ToolFactoryService } from './tool-factory.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DrawingLoadService {
  public activeDrawingData: ICollaborationLoadResponse | null = null;
  public pendingActions: IAction[] = [];
  public isLoading: boolean = false;
  public isLoaded: boolean = false;
  constructor(
    private toolFactoryService: ToolFactoryService,
    private drawingService: DrawingService,
    private storage: AngularFireStorage,
    private syncService: SyncDrawingService,
    private collaborationService: CollaborationService,
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
        this.toolFactoryService.create(action, true);
      }

      console.log(this.collaborationService['actions']);

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
