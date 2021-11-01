import { EventEmitter, Injectable, Output, Renderer2 } from '@angular/core';
import { DEFAULT_RGB_COLOR, RGB } from 'src/app/model/rgb.model';
import { DEFAULT_ALPHA, RGBA } from 'src/app/model/rgba.model';

/// Service qui contient les fonction pour dessiner a l'écran
@Injectable({
  providedIn: 'root',
})
export class DrawingService {

  @Output()
  drawingEmit = new EventEmitter<SVGElement>();
  id: string;
  saved = false;
  renderer: Renderer2;
  svgString = new EventEmitter<string>();
  lastObjectId = 0;
  isCreated = false;
  color: RGB = DEFAULT_RGB_COLOR;
  alpha: number = DEFAULT_ALPHA;
  width = 0;
  height = 0;
  drawing: SVGElement;
  numberOfStrates = 0;

  private objectList: Map<number, SVGElement>;

  constructor() {
    this.objectList = new Map<number, SVGElement>();
  }
  get rgbColorString(): string {
    return 'rgb(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ')';
  }

  get rgbaColorString(): string {
    return 'rgba(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ',' + this.alpha + ')';
  }

  get isSaved(): boolean {
    return (this.saved || !this.isCreated);
  }

  getObjectList(): Map<number, SVGElement> {
    return this.objectList;
  }

  get objects(): Map<number, SVGElement> {
    return this.objectList;
  }

  setObjectList(objList: Map<number, SVGElement>): void{
    this.objectList = objList;
  }

  getLastObject(): any {
      return this.getObjectList().get(this.lastObjectId)
  }
  
  addLayer(id: number): void {
    //console.log(this.renderer.nextSibling(this.objectList.get(id)));
    if (this.renderer.nextSibling(this.objectList.get(id)).getAttribute('id') !== 'gridRect') {
      let tempStrate : string;
      let siblingStrate: string;
      if (this.objectList.get(id) === undefined)
        return;
      else
      {
        tempStrate = (<any>this.objectList.get(id)).getAttribute('strate');
        siblingStrate = this.renderer.nextSibling(this.objectList.get(id)).getAttribute('strate');
        this.renderer.nextSibling(this.objectList.get(id)).setAttribute('strate', tempStrate);
        (<any>this.objectList.get(id)).setAttribute('strate',siblingStrate);
      }
      this.renderer.insertBefore(this.drawing,this.renderer.nextSibling(this.objectList.get(id)), this.objectList.get(id));
    }
    else {
      console.log("Stop");
      return;
    }
      //this.renderer.removeChild(this.drawing, this.objectList.get(id));
    console.log(this.drawing);
  }

  removeLayer(id: number): void {
    console.log(this.renderer.parentNode(this.objectList.get(id)));
    
  }

  /// Retrait d'un objet selon son ID
  removeObject(id: number): void {
    this.renderer.removeChild(this.drawing, this.objectList.get(id));
    this.saved = false;
    this.objectList.delete(id);
  }

  /// Ajout d'un objet dans la map d'objet du dessin
  addObject(obj: SVGElement): number {
    this.saved = false;
    if (!obj.id) {
      this.lastObjectId++;
      this.numberOfStrates++;
      
      this.renderer.setProperty(obj, 'id', this.lastObjectId);
      this.renderer.setProperty(obj, 'isSelected', true);
      
      this.renderer.setAttribute(obj, 'strate', this.numberOfStrates.toString());
    }
    const id: number = Number(obj.id);
    this.objectList.set(id, obj);
    this.renderer.insertBefore(this.drawing, obj, document.getElementById('gridRect') as Element as SVGElement);
    return id;
  }

  /// Récupère un objet selon son id dans la map d'objet
  getObject(id: number): SVGElement | undefined {
    return this.objectList.get(id);
  }

  /// Redéfinit la dimension du dessin
  setDimension(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setAttribute(this.drawing, 'width', width.toString());
    this.renderer.setAttribute(this.drawing, 'height', height.toString());
  }

  /// Change la couleur du fond d'écran
  setDrawingColor(rgba: RGBA): void {
    this.color = rgba.rgb;
    this.alpha = rgba.a;
    if (this.drawing) {
      this.renderer.setStyle(this.drawing, 'backgroundColor', `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
    }
  }

  /// Fonction pour appeller la cascade de bonne fonction pour réinitialisé un nouveau dessin
  newDrawing(width: number, height: number, rgba: RGBA): void {
    this.saved = false;
    this.objectList.clear();
    this.lastObjectId = 0;
    this.drawing = this.renderer.createElement('svg', 'svg');
    this.setDimension(width, height);
    this.setDrawingColor(rgba);
    this.drawingEmit.emit(this.drawing);
  }

  /// Permer l'ouverture d'un dessin sous la forme du model Drawing
  openDrawing(drawing: SVGElement): void {
    this.saved = false;
    this.objectList.clear();
    this.lastObjectId = 0;
    this.drawing = drawing;
    let lastId;
    const background: string | null = this.drawing.style.backgroundColor;
    if (background) {
      const splitBackground = /(?:^rgba|^rgb)?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/.exec(background);
      const rgba: RGBA = { rgb: { r: 255, g: 255, b: 255 }, a: 1 };
      if (splitBackground) {
        rgba.rgb.r = Number(splitBackground[1]);
        rgba.rgb.g = Number(splitBackground[2]);
        rgba.rgb.b = Number(splitBackground[3]);
        if (splitBackground[4]) {
          rgba.a = Number(splitBackground[4]);
        }
      }
      this.setDrawingColor(rgba);
    } else {
      this.setDrawingColor({ rgb: DEFAULT_RGB_COLOR, a: DEFAULT_ALPHA });
    }
    const toDelete: SVGElement[] = [];
    for (let i = 0; i < this.drawing.children.length; i++) {
      lastId = (this.drawing.children.item(i) as SVGElement).id;
      if (lastId === 'gridRect' || lastId === 'gridDefs') {
        toDelete.push(this.drawing.children.item(i) as SVGElement);
      } else {
        this.objectList.set(Number(lastId), this.drawing.children.item(i) as SVGElement);
        if (Number(lastId) > this.lastObjectId) {
          this.lastObjectId = Number(lastId);
        }
      }
    }

    toDelete.forEach((obj) => {
      this.drawing.removeChild(obj);
    });

    this.drawingEmit.emit(this.drawing);
  }
}
