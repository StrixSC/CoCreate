import { Injectable } from '@angular/core';

/// Classe pour gérer l'état du drawer des paramêtre
@Injectable({
  providedIn: 'root',
})
export class ToggleDrawerService {

  isOpened = true;

  /// Ouvre le drawer
  open(): void {
    this.isOpened = true;
  }

  /// Ferme le drawer
  close(): void {
    this.isOpened = false;
  }

}
