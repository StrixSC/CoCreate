import { SyncDrawingService } from './../syncdrawing.service';
import { RotateOnItselfCommand } from './../tools/selection-tool/rotate-command/rotate-on-itself-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { Renderer2 } from '@angular/core';
import { RotateTranslateCompositeCommand } from './../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { DrawingState, IRotateAction } from '../../model/IAction.model';
import { SyncCommand } from './sync-command';

export class RotateSyncCommand extends SyncCommand {
    public command: RotateTranslateCompositeCommand;
    public rotateCommand: RotateOnItselfCommand;
    private object: SVGElement | null;
    private totalRotation: number = 0;
    public isFlatAction: boolean = false;

    constructor(
        public payload: IRotateAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
        private syncService: SyncDrawingService
    ) {
        super();
    }

    execute(): SyncCommand | void {
        if (this.payload.state === DrawingState.move && this.isFlatAction) {
            this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);
            if (this.object) {
                this.command = new RotateTranslateCompositeCommand();
                this.rotateCommand = new RotateOnItselfCommand(this.renderer, [this.object], this.drawingService.drawing.getBoundingClientRect().left);
                this.command.addSubCommand(this.rotateCommand);
                this.rotateCommand.rotate(this.payload.angle);
                this.totalRotation = this.payload.angle;
                return this;
            }
            return;
        } else if (this.payload.state === DrawingState.up) {
            return this;
        } else {
            this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);

            if (!this.command && this.object) {
                this.command = new RotateTranslateCompositeCommand();
                this.rotateCommand = new RotateOnItselfCommand(this.renderer, [this.object], this.drawingService.drawing.getBoundingClientRect().left);
                this.command.addSubCommand(this.rotateCommand);
            }

            if (this.command && this.rotateCommand) {
                let newAngle = this.payload.angle;
                this.totalRotation += newAngle;
                this.rotateCommand.rotate(newAngle + this.rotateCommand.lastAngle);
            }
        }
    }

    undo(): void {
        const angle = this.totalRotation * Math.PI / 180;
        this.syncService.sendRotate(DrawingState.move, this.payload.selectedActionId, -1 * angle, true);
    }

    redo(): void {
        const angle = this.totalRotation * Math.PI / 180;
        this.syncService.sendRotate(DrawingState.move, this.payload.selectedActionId, angle, true);
    }

    update(payload: IRotateAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}