import { v4 } from 'uuid';
import { IFreedrawUpAction, IFreedrawUpLoadAction } from './../../model/IAction.model';
import { SyncDrawingService } from './../syncdrawing.service';
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
    private pencil: Pencil;
    public isFlatAction: boolean = false;
    constructor(
        public payload: IFreedrawAction & IFreedrawUpAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
        private syncService: SyncDrawingService
    ) {
        super();
    }

    execute(): SyncCommand | void {
        switch (this.payload.state) {
            case DrawingState.down:
                this.setupCommand();
                this.command = new PencilCommand(this.renderer, this.pencil, this.drawingService);
                this.command.userId = this.payload.userId;
                this.command.actionId = this.payload.actionId;
                this.command.execute();
                break;
            case DrawingState.move:
                this.command.addPoint({ x: this.payload.x, y: this.payload.y });
                break;
            case DrawingState.up:
                if (!this.isFlatAction) {
                    return this;
                } else {
                    this.setupCommand();
                    this.pencil.pointsList = this.payload.offsets;
                    this.command = new PencilCommand(this.renderer, this.pencil, this.drawingService);
                    this.command.userId = this.payload.userId;
                    this.command.actionId = this.payload.actionId;
                    this.command.execute();
                    return this;
                }
        }
    }

    undo(): void {
        this.syncService.sendDelete(this.payload.actionId, true);
    }

    redo(): void {
        this.syncService.sendFreedraw(DrawingState.up, this.command.pencilAttributes, true, this.payload.actionId);
    }

    update(payload: IFreedrawAction & IFreedrawUpAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }

    setupCommand(): void {
        this.pencil = {} as Pencil;
        this.pencil.pointsList = [{ x: this.payload.x, y: this.payload.y }];
        this.pencil.fill = "none";
        this.pencil.fillOpacity = "none";
        this.pencil.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
        this.pencil.strokeWidth = this.payload.width;
        this.pencil.strokeOpacity = fromAlpha(this.payload.a);
    }
}