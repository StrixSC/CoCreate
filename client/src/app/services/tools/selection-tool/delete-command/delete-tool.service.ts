import { Injectable } from '@angular/core';
import { CommandInvokerService } from '../../../command-invoker/command-invoker.service';
import { DrawingService } from '../../../drawing/drawing.service';
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
    private commandInvoker: CommandInvokerService,
    private drawingService: DrawingService,
  ) { }

  /// Creation et execution d'une commande de supression
  deleteSelection(): void {
    this.deleteCommand = new DeleteCommand(
      this.drawingService,
      this.selectionTool.getObjectList(),
    );

    this.commandInvoker.executeCommand(this.deleteCommand);

    this.selectionTool.removeSelection();
  }
}
