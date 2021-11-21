import { DeleteCommand } from '../tools/selection-tool/delete-command/delete-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IDeleteAction } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class DeleteSyncCommand extends SyncCommand {
    public command: DeleteCommand;

    constructor(
        public payload: IDeleteAction,
        private drawingService: DrawingService,
    ) {
        super();
    }

    execute(): SyncCommand | void {
        const object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);
        if (object) {
            this.command = new DeleteCommand(this.drawingService, [object]);
            this.command.execute();
            return this;
        }
    }

    undo(): void {
        this.command.undo();
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: IDeleteAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}