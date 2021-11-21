import { RotateOnItselfCommand } from './../tools/selection-tool/rotate-command/rotate-on-itself-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { Renderer2 } from '@angular/core';
import { RotateTranslateCompositeCommand } from './../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { IRotateAction } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class RotateSyncCommand extends SyncCommand {
    public command: RotateTranslateCompositeCommand;
    public rotateCommand: RotateOnItselfCommand;
    private object: SVGElement | null;

    constructor(public payload: IRotateAction, private renderer: Renderer2, private drawingService: DrawingService) {
        super();
    }

    execute(): SyncCommand | void {
        this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);
        let prevRotation = this.payload.angle;

        if (!this.command && this.object) {
            this.command = new RotateTranslateCompositeCommand();
            this.rotateCommand = new RotateOnItselfCommand(this.renderer, [this.object], this.drawingService.drawing.getBoundingClientRect().left);
            this.command.addSubCommand(this.rotateCommand);
        }

        this.rotateCommand.rotate(prevRotation);
        return this;
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