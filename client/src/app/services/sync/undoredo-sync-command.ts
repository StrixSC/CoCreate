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