import { v4 } from 'uuid';
import { SyncDrawingService } from './../syncdrawing.service';
import { RectangleCommand } from '../tools/tool-rectangle/rectangle-command';
import { IShapeAction } from '../../model/IAction.model';
import { toRGBString, fromAlpha } from '../../utils/colors';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { DrawingState } from '../../model/IAction.model';
import { Renderer2 } from "@angular/core";
import { SyncCommand } from './sync-command';
import { FilledShape } from '../tools/tool-rectangle/filed-shape.model';

export class RectangleSyncCommand extends SyncCommand {
    public command: RectangleCommand;
    public isFlatAction: boolean;
    private shape: FilledShape;

    constructor(
        public payload: IShapeAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
        private syncService: SyncDrawingService
    ) {
        super();
    }

    execute(): SyncCommand | void {
        switch (this.payload.state) {
            case DrawingState.down:
                this.setupShape();
                this.command = new RectangleCommand(this.renderer, this.shape, this.drawingService);
                this.command.userId = this.payload.userId;
                this.command.actionId = this.payload.actionId;

                this.command.execute();
                break;

            case DrawingState.move:
                this.command.setX(this.payload.x);
                this.command.setY(this.payload.y);
                this.command.setWidth(Math.abs(this.payload.x2 - this.payload.x));
                this.command.setHeight(Math.abs(this.payload.y2 - this.payload.y));
                break;

            case DrawingState.up:
                if (!this.isFlatAction) {
                    return this;
                } else {
                    this.setupShape();
                    this.command = new RectangleCommand(this.renderer, this.shape, this.drawingService);
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
        this.syncService.activeActionId = v4();
        this.command.actionId = this.syncService.activeActionId;
        this.payload.actionId = this.syncService.activeActionId;
        this.syncService.sendShape(DrawingState.up, this.payload.shapeStyle, this.payload.shapeType, this.shape, true);
    }

    update(payload: IShapeAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }

    setupShape(): void {
        this.shape = {} as FilledShape;
        this.shape.x = this.payload.x;
        this.shape.y = this.payload.y;
        this.shape.width = this.payload.x2 - this.payload.x;
        this.shape.height = this.payload.y2 - this.payload.y;
        this.shape.fill = toRGBString([this.payload.rFill, this.payload.gFill, this.payload.bFill]);
        this.shape.fillOpacity = fromAlpha(this.payload.aFill);
        this.shape.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
        this.shape.strokeOpacity = fromAlpha(this.payload.a);
        this.shape.strokeWidth = this.payload.width;
    }
}