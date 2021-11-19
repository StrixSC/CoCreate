import { IShapeAction } from './../../model/IAction.model';
import { EllipseCommand } from '../tools/tool-ellipse/ellipse-command';
import { toRGBString, fromAlpha } from '../../utils/colors';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { DrawingState } from '../../model/IAction.model';
import { Renderer2 } from "@angular/core";
import { SyncCommand } from './SyncCommand';
import { FilledShape } from '../tools/tool-rectangle/filed-shape.model';

export class EllipseSyncCommand extends SyncCommand {
    public command: EllipseCommand;

    constructor(
        private isActiveUser: boolean,
        public payload: IShapeAction,
        private renderer: Renderer2,
        private drawingService: DrawingService,
    ) {
        super();
    }

    execute(): SyncCommand | void {
        switch (this.payload.state) {
            case DrawingState.down:
                let shape = {} as FilledShape;
                shape.x = this.payload.x;
                shape.y = this.payload.y;
                shape.width = this.payload.x2 - this.payload.x;
                shape.height = this.payload.y2 - this.payload.y;
                shape.fill = toRGBString([this.payload.rFill, this.payload.gFill, this.payload.bFill]);
                shape.fillOpacity = fromAlpha(this.payload.aFill);
                shape.stroke = toRGBString([this.payload.r, this.payload.g, this.payload.b]);
                shape.strokeOpacity = fromAlpha(this.payload.a);
                shape.strokeWidth = this.payload.width;

                this.command = new EllipseCommand(this.renderer, shape, this.drawingService);
                this.command.userId = this.payload.userId;
                this.command.actionId = this.payload.actionId;
                this.command.isSyncAction = true;

                if (!this.isActiveUser) {
                    this.command.execute();
                }
                break;

            case DrawingState.move:
                this.command.setCX(this.payload.x);
                this.command.setCY(this.payload.y);
                this.command.setWidth(Math.abs(this.payload.x2 - this.payload.x));
                this.command.setHeight(Math.abs(this.payload.y2 - this.payload.y));
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

    update(payload: IShapeAction): SyncCommand | void {
        this.payload = payload;
        return this.execute();
    }
}