import { Component } from '@angular/core';
import { ToolsApplierColorsService} from 'src/app/services/tools/tools-applier-colors/tools-applier-colors.service'
import { CopyPasteToolService } from 'src/app/services/tools/copy-paste-tool/copy-paste-tool.service';
import { DeletingToolService } from 'src/app/services/tools/selection-tool/delete-command/delete-tool.service';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { LayerCommandService } from 'src/app/services/tools/selection-tool/layer-command/layer-command.service';

@Component({
  selector: 'app-selection-tool-parameter',
  templateUrl: './selection-tool-parameter.component.html',
  styleUrls: ['./selection-tool-parameter.component.scss'],
})
export class SelectionToolParameterComponent {

  constructor(
    private selectionService: SelectionToolService,
    private deletingService: DeletingToolService,
    private copyPasteService: CopyPasteToolService,
    private toolsApplierColorService: ToolsApplierColorsService,
    private layerService: LayerCommandService
    ) { }

  get toolName(): string {
    return this.selectionService.toolName;
  }

  get hasClipboardObject(): boolean {
    return this.copyPasteService.hasClipboardObject();
  }

  get hasSelection(): boolean {
    return this.selectionService.hasSelection();
  }

  /// Copy
  copy(): void {
    this.copyPasteService.copy();
  }

  /// Cut
  cut(): void {
    this.copyPasteService.cut();
  }

  /// Paste
  paste(): void {
    this.copyPasteService.paste();
  }

  /// Duplicate
  duplicate(): void {
    this.copyPasteService.duplicate();
  }

  /// SelectAll
  deleteSelection(): void {
    this.deletingService.deleteSelection();
  }

  changeColor(): void {
    this.toolsApplierColorService.changeColor(this.selectionService.getObjectList());
  }

  
  
  changeThickness(): void {
    this.selectionService.setSelectionWidth();
  }

  addLayer() : void {
    this.layerService.addLayer(this.selectionService.getObjectList()[0]);
  }

  removeLayer() : void {
    this.layerService.removeLayer(this.selectionService.getObjectList()[0]);
  }
}
