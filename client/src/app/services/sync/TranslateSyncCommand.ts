import { Renderer2 } from '@angular/core';
import { TranslateCommand } from './../tools/selection-tool/translate-command/translate-command';
import { DrawingState } from 'src/app/model/IAction.model';
import { ITranslateAction } from './../../model/IAction.model';
import { RotateTranslateCompositeCommand } from './../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SyncCommand } from './SyncCommand';

export class TranslateSyncCommand extends SyncCommand {
    public command: RotateTranslateCompositeCommand;
    public translateCommand: TranslateCommand;
    private object: SVGElement | null;
    constructor(
        private isActiveUser: boolean,
        public payload: ITranslateAction,
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
            this.command = new RotateTranslateCompositeCommand();
            this.translateCommand = new TranslateCommand(this.renderer, [this.object]);
            this.command.addSubCommand(this.translateCommand);
        }

        const lastX = this.translateCommand.lastXTranslate;
        const lastY = this.translateCommand.lastYTranslate;
        this.translateCommand.translate(lastX + this.payload.xTranslation, lastY + this.payload.yTranslation);
    }

    undo(): void {
        this.command.undo();
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: ITranslateAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}