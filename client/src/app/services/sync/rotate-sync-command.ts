import { RotateFromCenterCommand } from './../tools/selection-tool/rotate-command/rotate-from-center-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { Renderer2 } from '@angular/core';
import { RotateTranslateCompositeCommand } from './../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { IRotateAction } from '../../model/IAction.model';
import { DrawingState } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class RotateSyncCommand extends SyncCommand {
    public command: RotateTranslateCompositeCommand;
    public rotateCommand: RotateFromCenterCommand;
    private object: SVGElement | null;

    constructor(public payload: IRotateAction, private renderer: Renderer2, private drawingService: DrawingService) {
        super();
    }

    execute(): SyncCommand | void {
        if (this.payload.state === DrawingState.up) {
            return this;
        }

        this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);

        if (!this.command && this.object) {
            this.command = new RotateTranslateCompositeCommand();
            this.rotateCommand = new RotateFromCenterCommand(this.renderer, [this.object]);
            this.command.addSubCommand(this.rotateCommand);
        }

        this.rotateCommand.rotate(this.payload.angle, 0, 0);
    }

    undo(): void {
        this.command.undo();
    }

    redo(): void {
        this.command.execute();
    }

    update(payload: IRotateAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}