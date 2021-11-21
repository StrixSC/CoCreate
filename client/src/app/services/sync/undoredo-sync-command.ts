import { CollaborationService } from 'src/app/services/collaboration.service';
import { SyncDrawingService } from '../syncdrawing.service';
import { IUndoRedoAction } from '../../model/IAction.model';
import { DeleteCommand } from '../tools/selection-tool/delete-command/delete-command';
import { SyncCommand } from './sync-command';

export class UndoRedoSyncCommand extends SyncCommand {
    public command: DeleteCommand;

    constructor(
        public payload: IUndoRedoAction,
        private collaborationService: CollaborationService,
        private syncService: SyncDrawingService,
    ) {
        super();
    }

    execute(): SyncCommand | void {
        let action = {} as SyncCommand;
        if (this.payload.isUndo) {
            action = this.collaborationService.undoUserAction(this.payload.userId) as SyncCommand;
        } else {
            action = this.collaborationService.redoUserAction(this.payload.userId) as SyncCommand;
        }

        if (action) {
            if (action.isSelected && action.selectedBy === this.syncService.defaultPayload!.userId) {
                this.syncService.sendSelect(action.payload.actionId, false);
            }
        }
    }

    undo(): void {
        return;
    }

    redo(): void {
        return;
    }

    update(payload: IUndoRedoAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}