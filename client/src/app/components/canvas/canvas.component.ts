import { ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { ActivatedRoute } from '@angular/router';
import { DrawingLoadService } from './../../services/drawing-load.service';
import { ToolFactoryService } from './../../services/tool-factory.service';
import { SyncDrawingService } from './../../services/syncdrawing.service';
import { Router } from '@angular/router';
import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DrawingService } from 'src/app/services/drawing/drawing.service';

export enum EventTypes {
  Exception = 'Exception',
  Error = 'Error',
  Action = 'Action'
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('svgCanvas', { static: false })
  canvasDiv: ElementRef;

  svg: SVGElement;
  sub: Subscription;

  constructor(private drawingService: DrawingService, public renderer: Renderer2, private drawingLoadService: DrawingLoadService) {
    this.drawingService.renderer = this.renderer;
  }

  /// À l'initialisation, le canvas s'abonne au service de dessin pour reçevoir en string le svg
  ngAfterViewInit() {
    this.sub = this.drawingService.drawingEmit.subscribe((el: SVGElement) => {
      if (this.svg) {
        this.renderer.removeChild(this.canvasDiv.nativeElement, this.svg);
      }
      this.svg = el;
      this.renderer.appendChild(this.canvasDiv.nativeElement, this.svg);
      this.drawingLoadService.loadActions();
    });
  }

  /// la longueur de la zone de dessin
  get height(): number {
    return this.drawingService.isCreated ? this.drawingService.height : 0;
  }

  /// la largueur de la zone de dessin
  get width(): number {
    return this.drawingService.isCreated ? this.drawingService.width : 0;
  }

  /// la couleur de fond de la zone de dessin
  get backgroundColor(): string {
    return this.drawingService.rgbaColorString;
  }

  /// l'opacite de la zone de dessin
  get backgroundAlpha(): number {
    return this.drawingService.alpha;
  }

  get isDrawingCreated(): boolean {
    return this.drawingService.isCreated;
  }

}
