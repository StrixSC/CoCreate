import { SyncDrawingService } from './../syncdrawing.service';
import { IResizeAction } from './../../model/IAction.model';
import { Renderer2 } from '@angular/core';
import { DrawingState } from 'src/app/model/IAction.model';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SyncCommand } from './sync-command';
import { ResizeCommand } from '../tools/selection-tool/resize-command/resize-command';

export class ResizeSyncCommand extends SyncCommand {
    public command: ResizeCommand;
    private object: SVGElement | null;
    public isFlatAction: boolean = false;
    private totalXScale = 0;
    private totalYScale = 0;
    private totalXTranslation = 0;
    private totalYTranslation = 0;
    constructor(
        public payload: IResizeAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
        private syncService: SyncDrawingService
    ) {
        super();
    }

    execute(): SyncCommand | void {
        if (this.payload.state === DrawingState.up) {
            return this;
        }

        this.totalXScale = this.payload.xScale;
        this.totalYScale = this.payload.yScale;
        this.totalXTranslation = this.payload.xTranslation;
        this.totalYTranslation = this.payload.yTranslation;

        if (this.payload.state === DrawingState.move && this.isFlatAction) {
            this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);
            if (this.object) {
                this.command = new ResizeCommand(this.renderer, [this.object]);
                this.command.resize(this.totalXScale, this.totalYScale, this.totalXTranslation, this.totalYTranslation);
                return this;
            }
            return;
        }

        this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);

        if (!this.command && this.object) {
            this.command = new ResizeCommand(this.renderer, [this.object]);
        } else if (this.object) {
            this.command.resize(this.totalXScale, this.totalYScale, this.totalXTranslation, this.totalYTranslation);
        }
    }

    undo(): void {
        this.syncService.sendResize(DrawingState.move, this.payload.selectedActionId, 1 / this.totalXScale, 1 / this.totalYScale, this.totalXTranslation, this.totalYTranslation, true);
    }

    redo(): void {
        this.syncService.sendResize(DrawingState.move, this.payload.selectedActionId, this.totalXScale, this.totalYScale, this.totalXTranslation, this.totalYTranslation, true)
    }

    update(payload: IResizeAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}