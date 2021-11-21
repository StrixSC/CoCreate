import { IResizeAction } from './../../model/IAction.model';
import { Renderer2 } from '@angular/core';
import { TranslateCommand } from '../tools/selection-tool/translate-command/translate-command';
import { DrawingState } from 'src/app/model/IAction.model';
import { ITranslateAction } from '../../model/IAction.model';
import { RotateTranslateCompositeCommand } from '../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SyncCommand } from './sync-command';
import { ResizeCommand } from '../tools/selection-tool/resize-command/resize-command';

export class ResizeSyncCommand extends SyncCommand {
    public command: ResizeCommand;
    private object: SVGElement | null;
    constructor(
        public payload: IResizeAction,
        private renderer: Renderer2,
        private drawingService: DrawingService
    ) {
        super();
    }

    execute(): SyncCommand | void {
        if (this.payload.state === DrawingState.up) {
            return this;
        }

        this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);

        if (!this.command && this.object) {
            this.command = new ResizeCommand(this.renderer, [this.object]);
        } else {
            this.command.resize(this.payload.xScale, this.payload.yScale, this.payload.xTranslate, this.payload.yTranslate);
        }
    }

    undo(): void {
        this.command.undo();
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: IResizeAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}