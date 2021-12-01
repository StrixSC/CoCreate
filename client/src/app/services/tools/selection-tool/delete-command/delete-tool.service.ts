import { SyncDrawingService } from './../../../syncdrawing.service';
import { Injectable } from '@angular/core';
import { SelectionToolService } from '../selection-tool.service';
import { DeleteCommand } from './delete-command';

/// Service ayant comme fonction d'effectuer la supression de selection
@Injectable({
  providedIn: 'root',
})
export class DeletingToolService {

  private deleteCommand: DeleteCommand;

  constructor(
    private selectionTool: SelectionToolService,
    private syncDrawingService: SyncDrawingService
  ) { }

  /// Creation et execution d'une commande de supression
  deleteSelection(): void {
    const items = this.selectionTool.getObjectList();
    if (items.length <= 0) {
      return;
    }

    this.syncDrawingService.sendDelete(items[0].getAttribute('actionId')!);
    this.selectionTool.removeSelection();
  }
}
