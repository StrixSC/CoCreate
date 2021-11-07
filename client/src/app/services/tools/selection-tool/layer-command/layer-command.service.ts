import { Injectable } from '@angular/core';
// import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
// import { LayerCommand } from './layer-command';
// import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';

@Injectable({
  providedIn: 'root',
})
export class LayerCommandService {

  // private selectedObj: SVGElement;
  // private layeredMap: Map<string, [number, SVGElement]>
  // private objects: Map<number, SVGElement>;

  // private layerCommand: LayerCommand | null;

  constructor(
    // private rendererService: RendererProviderService,
    private drawingService: DrawingService,
  ) {
    // this.layeredMap = new Map<string, [number, SVGElement]>();
    // this.objects = this.getObjects();
  }

  getObjects(): Map<number, SVGElement> {
    return this.drawingService.getObjectList();
  }

  addLayer(currentObj: SVGElement): void {
    this.drawingService.addLayer(parseInt(currentObj.id));
  }

  removeLayer(currentObj: SVGElement): void {
    this.drawingService.removeLayer(parseInt(currentObj.id));
  }

}
