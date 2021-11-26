import { PencilCommand } from './../tools/pencil-tool/pencil-command';
import { Point } from 'src/app/model/point.model';
import { SyncDrawingService } from './../syncdrawing.service';
import { Renderer2 } from '@angular/core';
import { TranslateCommand } from '../tools/selection-tool/translate-command/translate-command';
import { DrawingState } from 'src/app/model/IAction.model';
import { ITranslateAction } from '../../model/IAction.model';
import { RotateTranslateCompositeCommand } from '../tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { SyncCommand } from './sync-command';

export class TranslateSyncCommand extends SyncCommand {
    public command: RotateTranslateCompositeCommand;
    public translateCommand: TranslateCommand;
    private object: SVGElement | null;
    public isFlatAction: boolean;
    private totalXTranslation: number = 0;
    private totalYTranslation: number = 0;
    constructor(
        public payload: ITranslateAction,
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
                this.translateCommand = new TranslateCommand(this.renderer, [this.object]);
                this.command.addSubCommand(this.translateCommand);
                this.translateCommand.translate(this.payload.xTranslation, this.payload.yTranslation);
                this.totalXTranslation = this.payload.xTranslation;
                this.totalYTranslation = this.payload.yTranslation;
                return this;
            }
            return;
        } else if (this.payload.state === DrawingState.up) {
            return this;
        } else {
            this.object = this.drawingService.getObjectByActionId(this.payload.selectedActionId);

            if (!this.command && this.object) {
                this.command = new RotateTranslateCompositeCommand();
                this.translateCommand = new TranslateCommand(this.renderer, [this.object]);
                this.command.addSubCommand(this.translateCommand);
            }

            if (this.command && this.translateCommand) {
                const lastY = this.translateCommand.lastYTranslate;
                const lastX = this.translateCommand.lastXTranslate;
                this.translateCommand.translate(lastX + this.payload.xTranslation, lastY + this.payload.yTranslation);
            }
        }
    }

    undo(): void {
        this.syncService.sendTranslate(DrawingState.move, this.payload.selectedActionId, -1 * this.totalXTranslation, -1 * this.totalYTranslation, true)
    }

    redo(): void {
        this.syncService.sendTranslate(DrawingState.move, this.payload.selectedActionId, this.totalXTranslation, this.totalYTranslation, true)
    }

    update(payload: ITranslateAction): SyncCommand | void {
        this.totalXTranslation += this.payload.xTranslation;
        this.totalYTranslation += this.payload.yTranslation;
        this.payload = payload;
        return this.execute();
    }

    getPathFromObject(object: SVGPolylineElement): Point[] | void {
        const points = object.getAttribute('points')
        if (points) {
            const segments = points.split(',').map((c) => c.split(' ')).map((c) => ({ x: Number(c[0]), y: Number(c[1]) } as Point));
            return segments;
        }
    }
}