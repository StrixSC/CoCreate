import {
  AfterViewInit, Component, ElementRef, HostListener,
  OnInit, ViewChild
} from '@angular/core';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { HSL } from 'src/app/model/hsl.model';
import { Point } from 'src/app/model/point.model';
import { ColorTransformerService } from 'src/app/services/color-transformer/color-transformer.service';
import { HSL_GRADIENT_HEIGHT, HSL_GRADIENT_WIDTH } from '../color-picker.constant';

const GRADIENT_START = 0;
const GRADIENT_END = 1;
const MID_GREY_RGB_FULL_OPACITY = 'rgba(128,128,128,1)';
const MID_GREY_RGB_TRANSPARENT = 'rgba(128,128,128,0)';
const BLACK_RGB_FULL_OPACITY = 'rgba(0,0,0,1)';
const BLACK_RGB_TRANSPARENT = 'rgba(0,0,0,0)';
const WHITE_RGB_FULL_OPACITY = 'rgba(255,255,255,1)';
const WHITE_RGB_TRANSPARENT = 'rgba(255,255,255,0)';
const SELECTION_CIRCLE_RADIUS = 6;

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnInit {
  /// Valeur pour l'affichage
  readonly width = HSL_GRADIENT_WIDTH;
  readonly height = HSL_GRADIENT_HEIGHT;

  @ViewChild('canvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;
  private isMouseDown = false;

  constructor(
    private colorTransformer: ColorTransformerService,
    private colorPickerService: ColorPickerService,
  ) { }

  /// Lors d'un changement de HSL, mettre à jour le gradient
  ngOnInit(): void {
    this.colorPickerService.hsl.valueChanges.subscribe((value) => { this.draw(); });
  }

  /// Définir la position actuel comme la position maximum
  ngAfterViewInit(): void {
    this.draw();
  }

  /// Cette section de code est inspiré de : https://malcoded.com/posts/angular-color-picker/
  /// Elle dessine le gradient HSL
  draw(): void {
    if (!this.ctx) {
      this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
    const hsl: HSL = this.colorPickerService.hsl.value;

    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;
    const rbg = this.colorTransformer.hue2rgb(hsl.h);
    this.ctx.fillStyle = 'rgba(' + rbg.r + ',' + rbg.g + ',' + rbg.b + ',1)';
    this.ctx.fillRect(0, 0, width, height);

    const greyGradient = this.ctx.createLinearGradient(0, 0, width, 0);
    greyGradient.addColorStop(GRADIENT_START, MID_GREY_RGB_FULL_OPACITY);
    greyGradient.addColorStop(GRADIENT_END, MID_GREY_RGB_TRANSPARENT);

    this.ctx.fillStyle = greyGradient;
    this.ctx.fillRect(0, 0, width, height);

    const whiteGradient = this.ctx.createLinearGradient(0, 0, 0, height / 2);
    whiteGradient.addColorStop(GRADIENT_END, BLACK_RGB_TRANSPARENT);
    whiteGradient.addColorStop(GRADIENT_START, BLACK_RGB_FULL_OPACITY);

    this.ctx.fillStyle = whiteGradient;
    this.ctx.fillRect(0, 0, width, height);

    const blackGradient = this.ctx.createLinearGradient(0, height / 2, 0, height);
    blackGradient.addColorStop(GRADIENT_END, WHITE_RGB_FULL_OPACITY);
    blackGradient.addColorStop(GRADIENT_START, WHITE_RGB_TRANSPARENT);

    this.ctx.fillStyle = blackGradient;
    this.ctx.fillRect(0, 0, width, height);

    // Déssiner le selecteur de hsl
    this.ctx.strokeStyle = 'white';
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(
      hsl.s * this.canvas.nativeElement.width,
      hsl.l * this.canvas.nativeElement.height,
      SELECTION_CIRCLE_RADIUS,
      0,
      2 * Math.PI,
    );
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }

  /// Met à jour les valeur s et l du hsl dans le form selon la position x,y dans le gradient
  private updateSL(point: Point): void {
    const saturationLightnessColor = this.getSaturationAndLightnessAtPosition(point);
    this.colorPickerService.hsl.patchValue({ s: saturationLightnessColor.s, l: saturationLightnessColor.l });
    this.draw();
  }

  /// Obtient la valeur de s et le selon la position x et y dans le gradient
  private getSaturationAndLightnessAtPosition(point: Point): { s: number, l: number } {
    if (point.x > this.canvas.nativeElement.width) {
      point.x = this.canvas.nativeElement.width;
    }
    if (point.x < 0) {
      point.x = 0;
    }
    if (point.y > this.canvas.nativeElement.height) {
      point.y = this.canvas.nativeElement.height;
    }
    if (point.y < 0) {
      point.y = 0;
    }
    const s = point.x / this.canvas.nativeElement.width;
    const l = point.y / this.canvas.nativeElement.height;
    return { s, l };
  }

  /// Si la souris à été appuyé précédament, mettre à jour le HSL
  onMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.updateSL({ x: event.offsetX, y: event.offsetY });
    }
  }

  /// Démarer un entrée de valeur par la souris et mettre à jour le HSL
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.updateSL({ x: event.offsetX, y: event.offsetY });
  }

  /// Arrêter la prise de donner par la souris dans la palette
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }
}
