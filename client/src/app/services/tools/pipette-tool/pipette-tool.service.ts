import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faEyeDropper } from '@fortawesome/free-solid-svg-icons';
import { Point } from 'src/app/model/point.model';
import { RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { RGBA } from 'src/app/model/rgba.model';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';

const IMAGE_DATA_POSITION_OFFSET = 4;
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
const A_OFFSET = 3;

/// Outil pour assigner la couleur d'un objet a la couleur primaire et secondaire,
/// clique gauche change la couleur primaire et clique droit la couleur secondaire
@Injectable({
  providedIn: 'root',
})
export class PipetteToolService implements Tools {
  readonly id = ToolIdConstants.PIPETTE_ID;
  readonly faIcon: IconDefinition = faEyeDropper;
  readonly toolName = 'Outil Pipette';
  private xmlSerializer: XMLSerializer;
  parameters: FormGroup;
  object: SVGAElement | undefined;

  constructor(
    private toolsColorService: ToolsColorService,
    private drawingService: DrawingService,
    private offsetManager: OffsetManagerService,
  ) {
    this.xmlSerializer = new XMLSerializer();
  }

  /// À l'appuis d'un clique de souris, on récupère l'objet cliqué et on modifie sa couleur
  async onPressed(event: MouseEvent): Promise<void> {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      const offset: Point = this.offsetManager.offsetFromMouseEvent(event);
      if (this.isInDrawing(offset)) {
        return new Promise<void>((resolve) => {
          const canvas: HTMLCanvasElement = document.createElement('canvas');
          canvas.setAttribute('crossorigin', 'anonymous');
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
          ctx.canvas.width = this.drawingService.width;
          ctx.canvas.height = this.drawingService.height;
          const stringSVG: string = this.xmlSerializer.serializeToString(this.drawingService.drawing);
          const domURL = window.URL;
          const img: HTMLImageElement = new Image();
          const svgBlob: Blob = new Blob([stringSVG], { type: 'image/svg+xml;charset=utf-8' });
          const url: string = domURL.createObjectURL(svgBlob);
          img.onload = (() => {
            ctx.drawImage(img, 0, 0);
            const imageData: ImageData = ctx.getImageData(offset.x, offset.y, 1, 1);
            const rgba: RGBA = this.getPixelColor(imageData, { x: 0, y: 0 });
            domURL.revokeObjectURL(url);
            event.button === LEFT_CLICK ?
              this.toolsColorService.setPrimaryColor(rgba.rgb, rgba.a) : this.toolsColorService.setSecondaryColor(rgba.rgb, rgba.a);
            resolve();
          });
          img.src = url;

        });
      }
    }
    return new Promise<void>((resolve) => resolve());
  }

  private isInDrawing(point: Point): boolean {
    return point.x >= 0 && point.x <= this.drawingService.width && point.y >= 0 && point.y <= this.drawingService.height;
  }

  private getPixelColor(imageData: ImageData, point: Point): RGBA {
    const offsetImage: number = (point.y * imageData.width + point.x) * IMAGE_DATA_POSITION_OFFSET;
    return {
      rgb: {
        r: imageData.data[offsetImage + R_OFFSET],
        g: imageData.data[offsetImage + G_OFFSET],
        b: imageData.data[offsetImage + B_OFFSET],
      }, a: Math.round(imageData.data[offsetImage + A_OFFSET] / RGB_MAX_VALUE * 100) / 100,
    };
  }

  /// Fonction non utilisé pour cet outil
  onRelease(event: MouseEvent): void {
    return;
  }

  /// Fonction non utilisé pour cet outil
  onMove(event: MouseEvent): void {
    return;
  }

  onKeyUp(event: KeyboardEvent): void {
    return;
  }
  onKeyDown(event: KeyboardEvent): void {
    return;
  }
  pickupTool(): void {
    return;
  }
  dropTool(): void {
    return;
  }
}
