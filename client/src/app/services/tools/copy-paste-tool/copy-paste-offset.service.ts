import { Injectable } from '@angular/core';
import { DrawingService } from '../../drawing/drawing.service';

/// Service s'occuppant de retourner le bon offset pour copy-paste
@Injectable({
  providedIn: 'root',
})
export class CopyPasteOffsetService {
  readonly OFFSET_CONST = 5;
  pasteOffset = { x: 0, y: 0 };
  duplicateOffset = { x: this.OFFSET_CONST, y: this.OFFSET_CONST };
  offsetInit: { x: number, y: number };

  constructor(private drawingService: DrawingService) { }

  /// Remise a zero du offset
  resetPasteOffset(): void {
    this.pasteOffset = { x: 0, y: 0 };
  }

  /// Remise a zero du offset pour la valeur par defaut
  resetToConstPasteOffset(): void {
    this.pasteOffset = { x: this.OFFSET_CONST, y: this.OFFSET_CONST };
  }

  /// Changement du paste offset selon la position du offset
  changePasteOffset(): void {
    this.pasteOffset.x += this.OFFSET_CONST;
    this.pasteOffset.y += this.OFFSET_CONST;
    if (this.offsetInit.x + this.OFFSET_CONST > this.drawingService.width
      || this.offsetInit.y + this.OFFSET_CONST > this.drawingService.height) {
      this.pasteOffset.x = 0;
      this.pasteOffset.y = 0;
    }
  }
}
