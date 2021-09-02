import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { faHeading, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { HotkeysEnablerService } from '../../hotkeys/hotkeys-enabler.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { INITIAL_TEXT_SIZE, LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { TextCommand } from './text-command';
import { Text } from './text.model';

/// Service de l'outil texte, permet d'ecrire du en svg
/// Il est possible d'ajuster le stroke width dans le form
@Injectable({
  providedIn: 'root',
})
export class TextToolService implements Tools {
  readonly toolName = 'Outil Texte';
  readonly faIcon: IconDefinition = faHeading;
  readonly id = ToolIdConstants.TEXT_ID;

  private x: number;
  private y: number;

  parameters: FormGroup;
  private textAlignment: FormControl;
  private textStyle: FormControl;
  private fontSize: FormControl;
  private fontFamily: FormControl;

  private textArea: HTMLTextAreaElement | null;
  private foreignObject: SVGForeignObjectElement | null;

  constructor(
    private offsetManager: OffsetManagerService,
    private colorTool: ToolsColorService,
    private drawingService: DrawingService,
    private rendererService: RendererProviderService,
    private commandInvoker: CommandInvokerService,
    private hotkeysEnabler: HotkeysEnablerService,
  ) {

    this.fontSize = new FormControl(INITIAL_TEXT_SIZE);
    this.textAlignment = new FormControl('start');
    this.textStyle = new FormControl('normal');
    this.fontFamily = new FormControl('"Times New Roman", Times, serif');
    this.parameters = new FormGroup({
      fontSize: this.fontSize,
      textAlignment: this.textAlignment,
      textStyle: this.textStyle,
      fontFamily: this.fontFamily,
    });
    this.colorTool.colorChangeEmitter.subscribe(() => {
      if (this.textArea) {
        this.rendererService.renderer.setStyle(
          this.textArea,
          'color',
          // Disable puisqu'il s'agit d'un string a injecter dans le DOM
          // tslint:disable-next-line: max-line-length
          `rgba(${this.colorTool.primaryColor.r},${this.colorTool.primaryColor.g},${this.colorTool.primaryColor.b},${this.colorTool.primaryAlpha})`);
      }
    });
    this.parameters.valueChanges.subscribe(() => {
      if (this.textArea) {
        this.setStyle(this.textArea);
        this.setAlignTextArea(this.textArea);
        this.computeTextSize();
      }
    });
  }

  getTextArea(): HTMLTextAreaElement | null { return this.textArea; }

  /// Création d'un polyline selon la position de l'evenement de souris, choisi les bonnes couleurs selon le clique de souris
  onPressed(event: MouseEvent): void {
    if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
      if (this.fontSize.value > 0) {
        const offset: { x: number, y: number } = this.offsetManager.offsetFromMouseEvent(event);
        if (!this.foreignObject) {
          this.x = offset.x;
          this.y = offset.y;
          this.foreignObject = this.rendererService.renderer.createElement('foreignObject', 'svg');

          this.rendererService.renderer.setAttribute(this.foreignObject, 'x', '0px');
          this.rendererService.renderer.setAttribute(this.foreignObject, 'y', '0px');
          this.rendererService.renderer.setAttribute(this.foreignObject, 'width', '100%');
          this.rendererService.renderer.setAttribute(this.foreignObject, 'height', '100%');

          this.textArea = this.rendererService.renderer.createElement('textarea');
          this.rendererService.renderer.setStyle(this.textArea, 'font-size', this.fontSize.value.toString() + 'px');
          this.rendererService.renderer.setStyle(
            this.textArea,
            'color',
            // Disable puisqu'il s'agit d'un string a injecter dans le DOM
            // tslint:disable-next-line: max-line-length
            `rgba(${this.colorTool.primaryColor.r},${this.colorTool.primaryColor.g},${this.colorTool.primaryColor.b},${this.colorTool.primaryAlpha})`);
          this.rendererService.renderer.setStyle(this.textArea, 'position', 'relative');
          this.rendererService.renderer.setStyle(this.textArea, 'left', this.x.toString() + 'px');
          this.rendererService.renderer.setStyle(this.textArea, 'top', this.y.toString() + 'px');
          this.rendererService.renderer.setStyle(this.textArea, 'height', this.fontSize.value.toString() + 'px');
          this.rendererService.renderer.setStyle(this.textArea, 'width', this.fontSize.value.toString() + 'px');
          this.rendererService.renderer.setStyle(this.textArea, 'border', 'border: 2px dashed');
          this.rendererService.renderer.setStyle(this.textArea, 'resize', 'none');
          this.rendererService.renderer.setStyle(this.textArea, 'background', 'transparent');
          this.rendererService.renderer.setAttribute(this.textArea, 'autofocus', 'true');
          this.rendererService.renderer.setAttribute(this.textArea, 'wrap', 'off');
          this.rendererService.renderer.setProperty(this.textArea, 'id', 'input-text-tool');
          this.rendererService.renderer.appendChild(this.foreignObject, this.textArea);
          this.setStyle(this.textArea as HTMLTextAreaElement);
          this.setAlignTextArea(this.textArea as HTMLTextAreaElement);

          this.drawingService.addObject(this.foreignObject as SVGForeignObjectElement);

          this.rendererService.renderer.listen(this.textArea, 'keydown', () => this.computeTextSize());
          this.rendererService.renderer.listen(this.textArea, 'focus', () => {
            this.hotkeysEnabler.disableHotkeys();
          });

        } else if (event.target && this.textArea) {
          const target: HTMLElement = event.target as HTMLElement;
          if (target.tagName !== this.textArea.tagName) {
            this.confirmText();
          }
        }
      }
    }
  }

  /// Réinitialisation de l'outil après avoir laisser le clique de la souris
  onRelease(event: MouseEvent): void {
    if (this.textArea) {
      this.textArea.focus();
    }
    return;
  }

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
    this.confirmText();
  }

  /// Confirmation et ajout du texte au dessin
  confirmText(): void {
    if (this.textArea && this.foreignObject) {
      this.hotkeysEnabler.enableHotkeys();
      const text: Text = {
        x: this.x,
        y: this.y,
        text: this.textArea.value,
        fontSize: this.fontSize.value,
        textAnchor: this.textAlignment.value,
        fontFamily: this.fontFamily.value,
        fontStyle: '',
        fontWeight: '',
        fill: 'none',
        fillOpacity: 0,
      };
      switch (this.textStyle.value) {
        case 'normal':
          text.fontStyle = 'normal';
          text.fontWeight = 'normal';
          break;
        case 'bold':
          text.fontStyle = 'normal';
          text.fontWeight = 'bold';
          break;
        case 'italic':
          text.fontStyle = 'italic';
          text.fontWeight = 'normal';
          break;
      }
      text.fill = this.colorTool.primaryColorString;
      text.fillOpacity = this.colorTool.primaryAlpha;
      const command = new TextCommand(this.rendererService.renderer, text, this.drawingService);
      this.commandInvoker.executeCommand(command);
      this.drawingService.removeObject(Number(this.foreignObject.id));
      this.foreignObject = null;
      this.textArea = null;
    }
  }

  /// Ajustement de la taille du textArea
  private computeTextSize(): void {
    if (this.textArea) {
      this.textArea.style.height = '1px';
      this.textArea.style.width = '1px';
      const width: number = this.textArea.scrollWidth + this.fontSize.value;
      switch (this.textAlignment.value) {
        case 'start':
          this.rendererService.renderer.setStyle(this.textArea, 'left', this.x + 'px');

          break;
        case 'middle':
          this.rendererService.renderer.setStyle(this.textArea, 'left', (this.x - width / 2) + 'px');
          break;
        case 'end':
          this.rendererService.renderer.setStyle(this.textArea, 'left', (this.x - width) + 'px');
          break;
      }
      this.textArea.style.height = (this.textArea.scrollHeight + this.fontSize.value) + 'px';
      this.textArea.style.width = width + 'px';

    }
  }

  /// Ajustement du format de la police
  private setFontSize(el: Element): void {
    this.rendererService.renderer.setStyle(el, 'font-size', this.fontSize.value.toString() + 'px');
  }

  /// Ajustement du style du text area
  private setStyle(el: Element): void {
    this.setFontSize(el);
    this.setColor(el);
    this.setFontFamily(el);
    this.setFontType(el);
  }

  /// Ajustement de l'alignement du text
  private setAlignTextArea(el: Element): void {
    switch (this.textAlignment.value) {
      case 'start':
        this.rendererService.renderer.setStyle(el, 'text-align-last', 'start');
        break;
      case 'middle':
        this.rendererService.renderer.setStyle(el, 'text-align-last', 'center');
        break;
      case 'end':
        this.rendererService.renderer.setStyle(el, 'text-align-last', 'end');
        break;
    }
  }

  /// Ajustement de la famille de police
  private setFontFamily(el: Element): void {
    this.rendererService.renderer.setStyle(el, 'font-family', this.fontFamily.value);
  }

  /// Ajustement des modificateur de police
  private setFontType(el: Element): void {
    switch (this.textStyle.value) {
      case 'normal':
        this.setNormal(el);
        break;
      case 'bold':
        this.setBold(el);
        break;
      case 'italic':
        this.setItalique(el);
        break;
    }
  }

  /// Mise en italique du texte
  private setItalique(el: Element): void {
    this.rendererService.renderer.setStyle(el, 'font-style', 'italic');
    this.rendererService.renderer.setStyle(el, 'font-weight', 'normal');
  }

  /// Mise a la normal du texte
  private setNormal(el: Element): void {
    this.rendererService.renderer.setStyle(el, 'font-style', 'normal');
    this.rendererService.renderer.setStyle(el, 'font-weight', 'normal');
  }

  /// Mise au gras du texte
  private setBold(el: Element): void {
    this.rendererService.renderer.setStyle(el, 'font-style', 'normal');
    this.rendererService.renderer.setStyle(el, 'font-weight', 'bold');
  }

  /// Ajustement de la couleur du text
  private setColor(el: Element) {
    this.rendererService.renderer.setStyle(el, 'fill', this.colorTool.primaryColorString);
    this.rendererService.renderer.setStyle(el, 'fillOpacity', this.colorTool.primaryAlpha.toString());
  }

}
