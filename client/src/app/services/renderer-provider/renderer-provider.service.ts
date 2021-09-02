import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/// Classe qui permet de fabriquer un renderer pour les services pour séparer des dépendances des components
@Injectable({
  providedIn: 'root',
})
export class RendererProviderService {

  /// Renderer construit lors de l'injection du service
  readonly renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }
}
