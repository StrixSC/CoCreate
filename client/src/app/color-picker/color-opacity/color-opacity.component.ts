import {
  AfterViewInit, Component, ElementRef, HostListener,
  OnInit, ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { ColorTransformerService } from 'src/app/services/color-transformer/color-transformer.service';
import { HSL_GRADIENT_WIDTH, OPACITY_HEIGHT } from '../color-picker.constant';

const GRADIENT_START = 0;
const GRADIENT_END = 1;
const SELECTOR_WIDTH = 3;
const MID_GREY_HEX_COLOR = '#AAAAAA';

@Component({
  selector: 'app-color-opacity',
  templateUrl: './color-opacity.component.html',
  styleUrls: ['./color-opacity.component.scss'],
})
export class ColorOpacityComponent implements AfterViewInit, OnInit {
  /// Valeur pour l'affichage
  readonly width = HSL_GRADIENT_WIDTH;
  readonly height = OPACITY_HEIGHT;

  @ViewChild('canvas', { static: false })
  opacityCanvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;
  private isMouseDown = false;
  private selectedWidth = 0;

  constructor(
    private colorTransformer: ColorTransformerService,
    private colorPickerService: ColorPickerService,
  ) { }

  /// Définit les subscriptions lors des changements de valeurs pour changer son affichage
  ngOnInit(): void {
    this.hsl.valueChanges.subscribe((): void => this.draw());
    this.a.valueChanges.subscribe((alpha: number): void => {
      this.selectedWidth = this.opacityCanvas.nativeElement.width * alpha;
      this.draw();
    });
  }

  /// Définit la selection à la valeur maximum et déssine le résultat
  ngAfterViewInit() {
    this.selectedWidth = this.opacityCanvas.nativeElement.width;
    this.draw();
  }

  /// Obtenir le form control pour la valeur du hsl pour le service
  get hsl(): FormGroup {
    return this.colorPickerService.hsl;
  }

  /// Obtenir le form control pour la valeur de l'alpha du service
  get a(): FormControl {
    return this.colorPickerService.a;
  }

  /// Cette section de code est inspiré de : https://malcoded.com/posts/angular-color-picker/
  draw(): void {
    if (!this.ctx) {
      this.ctx = this.opacityCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    const width = this.opacityCanvas.nativeElement.width;
    const height = this.opacityCanvas.nativeElement.height;

    this.ctx.clearRect(0, 0, width, height);

    this.drawOpacitySliderBackground(width, height);

    const gradient = this.ctx.createLinearGradient(0, 0, width, 0);
    const rgb = this.colorTransformer.hsl2rgb(this.hsl.value);
    gradient.addColorStop(GRADIENT_START, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0)');
    gradient.addColorStop(GRADIENT_END, 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)');
    this.ctx.beginPath();
    this.ctx.rect(0, 0, width, height);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    const selectedPercentageOfWidth = (1 - (this.selectedWidth / width));
    const colorValue = (RGB_MAX_VALUE - Math.floor(RGB_MAX_VALUE * selectedPercentageOfWidth * 0.9));
    this.ctx.strokeStyle = 'rgba(' + colorValue + ', ' + colorValue + ',' + colorValue + ', 1) ';
    this.ctx.lineWidth = SELECTOR_WIDTH;
    this.ctx.rect(this.selectedWidth - SELECTOR_WIDTH, 0, SELECTOR_WIDTH * 2, height);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /// Création de la grille pour voir la différence d'opacité
  private drawOpacitySliderBackground(width: number, height: number) {
    const squareSize = height / 6;
    for (let dx = 0; dx <= width; dx += squareSize * 2) {
      for (let dy = 0; dy <= height; dy += squareSize * 2) {
        this.ctx.beginPath();
        this.ctx.fillStyle = MID_GREY_HEX_COLOR;
        this.ctx.rect(dx, dy, squareSize, squareSize);
        this.ctx.fill();
        this.ctx.closePath();
      }
    }
    for (let dx = squareSize; dx <= width; dx += squareSize * 2) {
      for (let dy = squareSize; dy <= height; dy += squareSize * 2) {
        this.ctx.beginPath();
        this.ctx.fillStyle = MID_GREY_HEX_COLOR;
        this.ctx.rect(dx, dy, squareSize, squareSize);
        this.ctx.fill();
        this.ctx.closePath();
      }
    }
  }

  /// Change la valeur de l'alpha dans le service pour la valeur a la position courrante
  private updateOpacity(x: number): void {
    this.selectedWidth = x;
    const opacityValue = this.getOpacityAtPosition(x);
    this.a.setValue(opacityValue);
    this.draw();
  }

  /// Retourne le pourcentage de l'opacité selon la position de x dans l'élément
  private getOpacityAtPosition(x: number): number {
    if (x > this.opacityCanvas.nativeElement.width) {
      x = this.opacityCanvas.nativeElement.width;
    }
    if (x < 0) {
      x = 0;
    }
    const percentage = Math.round(x / this.opacityCanvas.nativeElement.width * 100) / 100;
    return percentage;
  }

  /// Éffectuer la prise de valeur de la position de la souris pour convertir vers une valeur d'alpha
  onMouseMove(event: MouseEvent): void {
    if (this.isMouseDown) {
      this.updateOpacity(event.offsetX);
    }
  }

  /// Éffectuer la prise de valeur de la position de la souris pour convertir vers une valeur d'alpha
  onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.updateOpacity(event.offsetX);
  }

  /// Assure que lorsqu'on relâche la souris, on arrete la prise d'information des évenements de souris
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isMouseDown = false;
  }
}
