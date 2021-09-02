import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { MAX_HUE } from 'src/app/model/hsl.model';
import { HSL_GRADIENT_HEIGHT, HUE_WIDTH } from '../color-picker.constant';

const ONE_SIXT_GRADIENT = 1 / 6;
const GRADIENT_START = 0;
const GRADIENT_END = 1;
const SELECTOR_WIDTH = 3;

/// Cette classe permet de choisir le hue de la couleur sur un gradient de hue (0,360)
@Component({
  selector: 'app-color-slider',
  templateUrl: './color-slider.component.html',
  styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit, OnInit {
  /// Valeur pour l'affichage
  readonly height = HSL_GRADIENT_HEIGHT;
  readonly width = HUE_WIDTH;

  @ViewChild('canvas', { static: false })
  canvas: ElementRef<HTMLCanvasElement>;

  hue: FormControl;

  private ctx: CanvasRenderingContext2D;
  private isMouseDown = false;
  private selectedHeight = 0;

  constructor(private colorPickerService: ColorPickerService) { }

  /// Defini le hue puis subscribe lorsque sa valeur change
  ngOnInit(): void {
    this.hue = this.colorPickerService.hsl.get('h') as FormControl;
    this.hue.valueChanges.subscribe((value) => {
      this.selectedHeight = value / MAX_HUE * this.canvas.nativeElement.height;
      this.draw();
    });
  }

  ngAfterViewInit(): void {
    this.selectedHeight = this.canvas.nativeElement.height / 2;
    this.draw();
  }

  /// Cette section de code est inspiré de : https://malcoded.com/posts/angular-color-picker/
  draw(): void {
    if (!this.ctx) {
      this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
    const width = this.canvas.nativeElement.width;
    const height = this.canvas.nativeElement.height;
    this.ctx.clearRect(0, 0, width, height);
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(GRADIENT_START, 'rgba(255, 0, 0, 1)');
    gradient.addColorStop(ONE_SIXT_GRADIENT, 'rgba(255, 255, 0, 1)');
    gradient.addColorStop(ONE_SIXT_GRADIENT * 2, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(ONE_SIXT_GRADIENT * 3, 'rgba(0, 255, 255, 1)');
    gradient.addColorStop(ONE_SIXT_GRADIENT * 4, 'rgba(0, 0, 255, 1)');
    gradient.addColorStop(ONE_SIXT_GRADIENT * 5, 'rgba(255, 0, 255, 1)');
    gradient.addColorStop(GRADIENT_END, 'rgba(255, 0, 0, 1)');
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, height);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = SELECTOR_WIDTH;
    this.ctx.rect(0, this.selectedHeight - SELECTOR_WIDTH, width, SELECTOR_WIDTH * 2);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /// permet d'obtenir la valeur du hue a la position y
  private getHueAtPosition(y: number): number {
    if (y > this.canvas.nativeElement.height) {
      y = this.canvas.nativeElement.height;
    }
    if (y < 0) {
      y = 0;
    }
    const heightPercentage = y / this.canvas.nativeElement.height;
    return MAX_HUE * heightPercentage;
  }

  /// Met à jour la valeur hue selon la position en y
  private updateHue(y: number): void {
    this.selectedHeight = y;
    const h = this.getHueAtPosition(y);
    this.hue.setValue(h);
    this.draw();
  }

  /// Met à jour le hue selon la position de la souris après avoir activé un entrée de souris
  onMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.updateHue(event.offsetY);
    }
  }

  /// Met à jour le hue selon la position de la souris et active un entrée de souris
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.updateHue(event.offsetY);
  }

  /// Désactive un entrée de souris
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }
}
