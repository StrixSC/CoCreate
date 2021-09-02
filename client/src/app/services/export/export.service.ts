import { Injectable } from '@angular/core';
import { DrawingService } from '../drawing/drawing.service';
import { GridService } from '../tools/grid-tool/grid.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';
import { SOURCE_KEY } from '../tools/tools-constants';
import { CanvasToBMP } from '../../classes/canvas-to-bmp';
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
  async exportToFormat(format: string) {
    const isGridActivated = this.gridService.activateGrid.value;
    this.gridService.activateGrid.setValue(false);
    this.selectionService.hideSelection();
    switch (format) {
      case 'SVG':
        this.exportAsSVG();
        break;
      case 'JPG':
        this.asImage(format, 'image/jpeg');
        break;
      case 'PNG':
        this.asImage(format, 'image/png');
        break;
      case 'BMP':
        this.asBMP();
    }
    this.selectionService.showSelection();

    this.gridService.activateGrid.setValue(isGridActivated);
  }

  // exporter le dessin en tant que SVG
  async exportAsSVG(): Promise<void> {
    const xmlSerializer = new XMLSerializer();
    const svgObject = this.drawingService.drawing;
    svgObject.setAttribute('id', this.drawingService.id);
    svgObject.setAttribute('sourceKey', SOURCE_KEY);
    svgObject.setAttribute('name', 'default');
    const blob = new Blob([xmlSerializer.serializeToString(svgObject)]);
    const svgURL = URL.createObjectURL(blob);
    const result = this.triggerDownload(svgURL, 'svg');
    return result;
  }

  // exporter le dessin en format image qui inclut PNG ou JPG
  asImage(format: string, formatEncoded: string) {
    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.canvas.width = this.drawingService.width;
    ctx.canvas.height = this.drawingService.height;

    const data = (new XMLSerializer()).serializeToString(this.drawingService.drawing);
    const DOMURL = window.URL;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = (() => {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      const imgURI = canvas
        .toDataURL(formatEncoded);
      this.triggerDownload(imgURI, format);

    });

    img.src = url;

  }
  // Exporter l'image en tant que image bitmap
  asBMP() {

    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.canvas.width = this.drawingService.width;
    ctx.canvas.height = this.drawingService.height;

    const data = (new XMLSerializer()).serializeToString(this.drawingService.drawing);
    const DOMURL = window.URL;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = (() => {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);

      const imgURI = (new CanvasToBMP()).toDataURL(canvas);
      const a = document.createElement('a');
      a.setAttribute('download', 'filename.bmp');
      a.setAttribute('href', imgURI);
      a.click();
    });

    img.src = url;
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
