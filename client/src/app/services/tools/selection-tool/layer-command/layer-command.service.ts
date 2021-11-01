import { Injectable } from '@angular/core';
//import { ICommand } from 'src/app/interfaces/command.interface';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { RendererProviderService } from 'src/app/services/renderer-provider/renderer-provider.service';

@Injectable({
  providedIn: 'root'
})
export class LayerCommandService {
  
  private selectedObj: SVGElement;
  private layeredMap: Map<string, [number, SVGElement]>
  private objects: Map<number, SVGElement>;

  constructor(
    private rendererService: RendererProviderService,
    private drawingService: DrawingService
  ) {
    this.layeredMap = new Map<string, [number, SVGElement]>();
    this.objects = this.getObjects();
  }

  getObjects():  Map<number, SVGElement> {
    return this.drawingService.getObjectList();
  }

  addLayer(currentObj: SVGElement) : void {
    /*let currentStrate: number;
    let tempStrate: string | null = currentObj.getAttribute('strate');
    let objects : Map<number, SVGElement> = this.getObjects()
    if (tempStrate === null) return;
    else
      {
        currentStrate = parseInt(tempStrate);
      }

    //for (let i = 0; i < objects.size; i++) {
      for (let obj of objects) {
        let strate: string | null = obj[1].getAttribute('strate');
        if(strate !== null)
          this.layeredMap.set(strate, obj);
        if(tempStrate === strate) {
          console.log(strate);
        }
      }
    //}

    this.drawingService.setObjectList(objects);
    console.log(this.layeredMap);*/
    this.drawingService.addLayer(parseInt(currentObj.id))
  }

  removeLayer(currentObj: SVGElement) : void {
    this.drawingService.removeLayer(parseInt(currentObj.id))
  }

}
