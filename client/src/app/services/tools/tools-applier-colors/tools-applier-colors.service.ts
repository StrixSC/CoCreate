import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faTint } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { ColorApplierCommand } from './color-applier-command';

/// Outil pour changer la couleur d'un objet, clique gauche change la couleur primaire et clique droit la couleur secondaire
@Injectable({
  providedIn: 'root',
})
export class ToolsApplierColorsService implements Tools {
  readonly id = ToolIdConstants.APPLIER_ID;
  readonly faIcon: IconDefinition = faTint;
  readonly toolName = 'Outil Applicateur de couleur';
  private colorApplierCommand: ColorApplierCommand | null;
  parameters: FormGroup;

  constructor(
    private toolsColorService: ToolsColorService,
    private rendererService: RendererProviderService,
  ) { }

  /// À l'appuis d'un clique de souris, on récupère l'objet cliqué et on modifie sa couleur
  onPressed(event: MouseEvent): void {
    let target = event.target as SVGElement;
    if (target.getAttribute('name') === 'pen' || target.tagName === 'tspan' || target.getAttribute('name') === 'feather' ||
    target.getAttribute('name') === 'spray') {
      target = target.parentNode as SVGElement;
    }
    let colorAttributeString: string;
    let alphaAttributeString: string;
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (event.button === LEFT_CLICK) {
        colorAttributeString = 'primaryColor';
        alphaAttributeString = 'primaryOpacity';
      } else {
        colorAttributeString = 'secondaryColor';
        alphaAttributeString = 'secondaryOpacity';
      }
      this.colorApplierCommand = new ColorApplierCommand(
        this.rendererService.renderer,
        target,
        this.toolsColorService.primaryColorString,
        this.toolsColorService.primaryAlpha,
        colorAttributeString, alphaAttributeString,
      );
    }
  }

  /// Retourne la commande de color applier
  onRelease(event: MouseEvent): void | ICommand {
    if (this.colorApplierCommand) {
      this.colorApplierCommand.execute();
      const tempColorApplierCommand: ColorApplierCommand = this.colorApplierCommand;
      this.colorApplierCommand = null;
      return tempColorApplierCommand;
    }
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
