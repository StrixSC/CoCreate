import { Injectable } from '@angular/core';
import { CanvasToBMP } from '../../classes/canvas-to-bmp';
import { DrawingService } from '../drawing/drawing.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { SOURCE_KEY } from '../tools/tools-constants';
@Injectable({
  providedIn: 'root',
})

export class ExportService {
  constructor(
    private drawingService: DrawingService,
    private gridService: GridService,
    private selectionService: SelectionToolService,
  ) { }

  /// Permet d'exporter un fichier dans le format voulu sous forme de string
  exportToFormat(format: string) {
    const isGridActivated = this.gridService.activateGrid.value;
    this.gridService.activateGrid.setValue(false);
    let returnBlob: Blob | null = null;
    switch (format) {
      case 'SVG':
        returnBlob = this.exportAsSVG();
      case 'JPG':
        returnBlob = this.asImage();
      case 'BMP':
        returnBlob = this.asBMP();
      default:
        returnBlob = this.exportAsSVG();
    }
    this.selectionService.showSelection();
    this.gridService.activateGrid.setValue(isGridActivated);
    return returnBlob;
  }

  // exporter le dessin en tant que SVG
  exportAsSVG(): Blob {
    const xmlSerializer = new XMLSerializer();
    const svgObject = this.drawingService.drawing;
    svgObject.setAttribute('id', this.drawingService.id);
    svgObject.setAttribute('sourceKey', SOURCE_KEY);
    svgObject.setAttribute('name', 'default');
    const blob = new Blob([xmlSerializer.serializeToString(svgObject)]);
    return blob;
  }

  // exporter le dessin en format image qui inclut PNG ou JPG
  asImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.canvas.width = this.drawingService.width;
    ctx.canvas.height = this.drawingService.height;
    const data = (new XMLSerializer()).serializeToString(this.drawingService.drawing);
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    return svgBlob
  }

  // Exporter l'image en tant que image bitmap
  asBMP() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.canvas.width = this.drawingService.width;
    ctx.canvas.height = this.drawingService.height;
    const data = (new XMLSerializer()).serializeToString(this.drawingService.drawing);
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    return svgBlob;
  }

  /// Appelle l'evenement du download d'un image
  triggerDownload(imgURI: any, format: string) {
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true,
    });

    const a = document.createElement('a');
    a.setAttribute('download', `filename.${format.toLowerCase()}`);
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');

    a.dispatchEvent(evt);
  }

}
