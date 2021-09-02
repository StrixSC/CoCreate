import { ElementRef, Injectable } from '@angular/core';
// Offset du workspace pour la hauteur pour remplir l'écran
export const HEIGHT_OFFSET = 4;

/// Service pour recuperer les éléments du workspace pour connaître sa taille et ses éléments
@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {

  el: ElementRef;
  scrolledElement: ElementRef;

  get width() {
    if (this.scrolledElement) {
      return this.scrolledElement.nativeElement.offsetWidth;
    } else {
      return 0;
    }
  }

  /// Height offset est pour enlever les pixels de trop du drawer component
  get height() {
    if (this.scrolledElement) {
      return this.scrolledElement.nativeElement.offsetHeight - HEIGHT_OFFSET;
    } else {
      return 0;
    }
  }
}
