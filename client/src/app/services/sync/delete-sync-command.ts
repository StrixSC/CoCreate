import { DeleteCommand } from '../tools/selection-tool/delete-command/delete-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IDeleteAction } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class DeleteSyncCommand extends SyncCommand {
    public command: DeleteCommand;

    constructor(
        public payload: IDeleteAction,
        private drawingService: DrawingService,
        private drawnAction?: SyncCommand
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
        if (this.drawnAction) {
            this.drawnAction!.redo();
        }
    }

    redo(): void {
        if (this.drawnAction) {
            const object = this.command.objectList[0];
            this.drawnAction!.undo(object);
        }
    }

    update(payload: IDeleteAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}