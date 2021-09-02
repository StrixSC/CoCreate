import { Injectable } from '@angular/core';
import { WorkspaceService } from '../workspace/workspace.service';

/// Classe permettant de simuler le comportement de
/// offsetX et offsetY dans des browsers autre que Chrome
@Injectable({
  providedIn: 'root',
})
export class OffsetManagerService {

  constructor(private workspaceService: WorkspaceService) { }

  /// Retourne la position relative selon le workspace

  offsetFromMouseEvent(event: MouseEvent): { x: number, y: number } {
    let x: number; let y: number;
    if (/Chrome/.test(navigator.userAgent)) {
      x = event.offsetX; y = event.offsetY;
    } else {
      x = event.pageX -
        this.workspaceService.el.nativeElement.getBoundingClientRect().x +
        this.workspaceService.scrolledElement.nativeElement.scrollLeft;
      y = event.pageY -
        this.workspaceService.el.nativeElement.getBoundingClientRect().y +
        this.workspaceService.scrolledElement.nativeElement.scrollTop;
    }
    return { x, y };
  }
}
