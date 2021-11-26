import { ActionData } from './../collaboration.service';
import { SyncDrawingService } from './../syncdrawing.service';
import { DeleteCommand } from '../tools/selection-tool/delete-command/delete-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IDeleteAction } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class DeleteSyncCommand extends SyncCommand {
    public command: DeleteCommand;

    constructor(
        public payload: IDeleteAction,
        private drawingService: DrawingService,
        private drawnAction: SyncCommand
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
        this.drawnAction.redo();
    }

    redo(): void {
        const obj = this.command.objectList[0];
        console.log(obj);
        this.drawnAction.undo();
    }

    update(payload: IDeleteAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}