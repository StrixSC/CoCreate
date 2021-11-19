import { CollaborationService } from 'src/app/services/collaboration.service';
import { IUndoRedoAction } from './../../model/IAction.model';
import { DeleteCommand } from './../tools/selection-tool/delete-command/delete-command';
import { SyncCommand } from './SyncCommand';

export class UndoRedoSyncCommand extends SyncCommand {
    public command: DeleteCommand;

    constructor(
        public payload: IUndoRedoAction,
        private collaborationService: CollaborationService,
        private isActiveUser: boolean
    ) {
        super();
    }

    execute(): SyncCommand | void {
        if (this.payload.isUndo) {
            this.collaborationService.undoUserAction(this.payload.userId, this.payload.actionId, this.isActiveUser);
        } else {
            this.collaborationService.redoUserAction(this.payload.userId, this.payload.actionId, this.isActiveUser);
        }
    }

    undo(): void {
        return;
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: IUndoRedoAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}