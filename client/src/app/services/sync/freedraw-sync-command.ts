import { CollaborationService } from 'src/app/services/collaboration.service';
import { PencilCommand } from '../tools/pencil-tool/pencil-command';
import { Pencil } from '../tools/pencil-tool/pencil.model';
import { toRGBString, fromAlpha } from '../../utils/colors';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { IFreedrawAction, DrawingState } from '../../model/IAction.model';
import { Renderer2 } from "@angular/core";
import { SyncCommand } from './sync-command';

export class FreedrawSyncCommand extends SyncCommand {
    public command: PencilCommand;

    constructor(
        private isActiveUser: boolean,
        public payload: IFreedrawAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
    ) {
        super();
    }

    execute(): SyncCommand | void {
        switch (this.payload.state) {
            case DrawingState.down:
                let pencil: Pencil = {} as Pencil;
                pencil.pointsList = [{ x: this.payload.x, y: this.payload.y }];
                pencil.fill = "none";
                pencil.fillOpacity = "none";
                pencil.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
                pencil.strokeWidth = this.payload.width;
                pencil.strokeOpacity = fromAlpha(this.payload.a);

                this.command = new PencilCommand(this.renderer, pencil, this.drawingService);
                this.command.userId = this.payload.userId;
                this.command.actionId = this.payload.actionId;

                this.command.execute();
                break;
            case DrawingState.move:
                this.command.addPoint({ x: this.payload.x, y: this.payload.y });
                break;
            case DrawingState.up:
                return this;
        }
    }

    undo(): void {
        this.command.undo();
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: IFreedrawAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}