import { EventEmitter, Injectable, Output } from '@angular/core';
import { ICommand } from '../../interfaces/command.interface';
import { DrawingService } from '../drawing/drawing.service';
import { SelectionToolService } from '../tools/selection-tool/selection-tool.service';

/// Cette classe permet de faire l'invocation des undo et redo des commandes
@Injectable({
  providedIn: 'root',
})
export class CommandInvokerService {

  private commandsList: ICommand[] = [];
  private undonedCommandsList: ICommand[] = [];

  @Output()
  commandCallEmitter = new EventEmitter<string>();

  constructor(
    private selectionService: SelectionToolService,
    private drawingService: DrawingService,
  ) {
    this.drawingService.drawingEmit.subscribe(() => {
      this.clearCommandHistory();
    });
  }
  /// Retrait de tous les commandes dans les listes d'undo et redo
  private clearCommandHistory(): void {
    this.commandsList = [];
    this.undonedCommandsList = [];
  }

  /// Ajout d'une commande dans la liste de commande
  /// et remise à zero de la liste undo commande
  addCommand(command: ICommand): void {
    this.commandsList.push(command);
    this.undonedCommandsList = [];
  }

  /// Execution de la commande et ajout de cette derniere a la liste de commande
  executeCommand(command: ICommand): void {
    command.execute();
    this.addCommand(command);
  }

  /// Retourne s'il est possible de faire undo
  get canUndo(): boolean {
    return this.commandsList.length > 0;
  }

  /// Retourne s'il est possible de faire redo
  get canRedo(): boolean {
    return this.undonedCommandsList.length > 0;
  }

  /// Appelle la fonction undo de la commande sur le dessus de la pile et l'envoie
  /// a la liste de commande undo
  undo(): void {
    if (this.canUndo) {
      const undoneCommand = this.commandsList.pop() as ICommand;
      this.selectionService.removeSelection();
      undoneCommand.undo();
      this.undonedCommandsList.push(undoneCommand);
      this.commandCallEmitter.emit('undo');
    }
  }

  /// Appelle la fonction redo de la commande sur le dessus de la pile et l'envoie
  /// a la liste de commande redo
  redo(): void {
    if (this.canRedo) {
      const redoneCommand = this.undonedCommandsList.pop() as ICommand;
      this.selectionService.removeSelection();
      redoneCommand.execute();
      this.commandsList.push(redoneCommand);
      this.commandCallEmitter.emit('redo');
    }
  }
}
