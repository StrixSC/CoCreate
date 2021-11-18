import { DeleteCommand } from './tools/selection-tool/delete-command/delete-command';
import { RotateTranslateCompositeCommand } from './tools/selection-tool/rotate-translate-composite-command/rotate-translate-composite-command';
import { TranslateCommand } from './tools/selection-tool/translate-command/translate-command';
import { SyncDrawingService } from './syncdrawing.service';
import { IDeleteAction, ISelectionAction, ITranslateAction, IResizePayload } from './../model/IAction.model';
import { SelectionToolService } from 'src/app/services/tools/selection-tool/selection-tool.service';
import { EllipseCommand } from './tools/tool-ellipse/ellipse-command';
import { setStyle } from "src/app/utils/colors";
import { RectangleCommand } from "./tools/tool-rectangle/rectangle-command";
import { FilledShape } from "./tools/tool-rectangle/filed-shape.model";
import { CollaborationService } from "./collaboration.service";
import { toRGBString, fromAlpha } from "./../utils/colors";
import { ICommand } from "src/app/interfaces/command.interface";
import { DrawingService } from "src/app/services/drawing/drawing.service";
import {
  IDefaultActionPayload,
  IShapeAction,
  ActionType,
  IAction,
  IFreedrawAction,
  IFreedrawUpAction,
  DrawingState,
  IUndoRedoAction,
  ShapeType,
} from "../model/IAction.model";
import { Injectable } from "@angular/core";
import { Pencil } from "./tools/pencil-tool/pencil.model";
import { PencilCommand } from "./tools/pencil-tool/pencil-command";
import { RendererProviderService } from "./renderer-provider/renderer-provider.service";

@Injectable({
  providedIn: "root",
})
export class ToolFactoryService {
  private pendingExternalCommands: Map<string, ICommand> = new Map<string, ICommand>();

  tools: Record<ActionType | string, (payload: IAction) => any> = {
    Freedraw: (
      payload: IDefaultActionPayload & IFreedrawAction & IFreedrawUpAction
    ) => {
      if (payload.state === DrawingState.down) {
        let pencil: Pencil = {} as Pencil;
        pencil.pointsList = [{ x: payload.x, y: payload.y }];
        pencil.fill = "none";
        pencil.fillOpacity = "none";
        pencil.stroke = toRGBString([payload.r, payload.g, payload.b]);
        pencil.strokeWidth = payload.width;
        pencil.strokeOpacity = fromAlpha(payload.a);

        const command = new PencilCommand(
          this.rendererService.renderer,
          pencil,
          this.drawingService
        );
        command.actionId = payload.actionId;
        (command as PencilCommand).userId = payload.userId;
        this.pendingExternalCommands.set(command.actionId, command);
        if (this.syncService.defaultPayload!.userId !== payload.userId) {
          command.execute();
        }

      } else if (payload.state === DrawingState.move) {
        const command = this.pendingExternalCommands.get(payload.actionId) as PencilCommand;
        if (command) {
          command.addPoint({
            x: payload.x,
            y: payload.y,
          });
        }
      } else if (payload.state === DrawingState.up) {
        const command = this.pendingExternalCommands.get(payload.actionId) as PencilCommand;
        if (command) {
          this.addOrUpdateCollaboration(payload.userId, { data: payload, command, isUndone: false });
        }
      }
    },
    Select: (payload: ISelectionAction) => {
      if (payload.isSelected && payload.selectedBy === this.syncService.defaultPayload!.userId) {
        this.selectionService.selectByActionId(payload.actionId);
      }

      this.collaborationService.updateActionSelection(payload.userId, payload.actionId, payload.isSelected, payload.selectedBy || '');
    },
    Shape: (payload: IShapeAction) => {
      if (payload.state === DrawingState.down) {
        let shape = {} as FilledShape;
        shape.x = payload.x;
        shape.y = payload.y;
        shape.width = payload.x2 - payload.x;
        shape.height = payload.y2 - payload.y;
        shape.fill = toRGBString([payload.rFill, payload.gFill, payload.bFill]);
        shape.fillOpacity = fromAlpha(payload.aFill);
        shape.stroke = toRGBString([payload.r, payload.g, payload.b]);
        shape.strokeOpacity = fromAlpha(payload.a);
        shape.strokeWidth = payload.width;

        let command: ICommand;
        if (payload.shapeType === ShapeType.Ellipse) {
          command = new EllipseCommand(
            this.rendererService.renderer,
            shape,
            this.drawingService
          )
          command.isSyncAction = true;
          command.actionId = payload.actionId;
          (command as EllipseCommand).userId = payload.userId;
        } else {
          command = new RectangleCommand(
            this.rendererService.renderer,
            shape,
            this.drawingService
          );
          command.actionId = payload.actionId;
          (command as RectangleCommand).userId = payload.userId;
        }
        this.pendingExternalCommands.set(command.actionId, command);
        setStyle(
          shape,
          shape.fill,
          shape.fillOpacity,
          shape.stroke,
          shape.strokeOpacity,
          payload.shapeStyle
        );

        if (this.syncService.defaultPayload!.userId !== payload.userId) {
          command.execute();
        };
      } else if (payload.state === DrawingState.move) {
        if (payload.shapeType === ShapeType.Rectangle) {
          const command = this.pendingExternalCommands.get(payload.actionId) as RectangleCommand;
          if (command) {
            command.setX(payload.x);
            command.setY(payload.y);
            command.setWidth(Math.abs(payload.x2 - payload.x));
            command.setHeight(Math.abs(payload.y2 - payload.y));
          }
        } else {
          const command = this.pendingExternalCommands.get(payload.actionId) as EllipseCommand;
          if (command) {
            command.setCX(payload.x);
            command.setCY(payload.y);
            command.setWidth(Math.abs(payload.x2 - payload.x));
            command.setHeight(Math.abs(payload.y2 - payload.y));
          }
        }
      } else if (payload.state === DrawingState.up) {
        const command = this.pendingExternalCommands.get(payload.actionId);
        if (command) {
          this.addOrUpdateCollaboration(payload.userId, { data: payload, command, isUndone: false });
        }
      }

    },
    Delete: (payload: IDeleteAction) => {
      const isActiveUser: boolean = (this.syncService.defaultPayload!.userId === payload.userId);
      const object = this.drawingService.getObjectByActionId(payload.selectedActionId);
      if (object && !isActiveUser) {
        const command = new DeleteCommand(this.drawingService, [object]);
        command.execute();
        this.addOrUpdateCollaboration(payload.userId, { data: payload, command, isUndone: false });
      } else if (isActiveUser) {
        this.addOrUpdateCollaboration(payload.userId, { data: payload, command: {} as DeleteCommand, isUndone: false });
      }
    },
    Translate: (payload: ITranslateAction) => {
      const isActiveUser: boolean = (this.syncService.defaultPayload!.userId === payload.userId);
      console.log(payload);
      if (payload.state === DrawingState.move) {
        const ongoingAction = this.pendingExternalCommands.get(payload.actionId) as RotateTranslateCompositeCommand;
        if (!ongoingAction) {
          const action = this.collaborationService.getActionById(payload.selectedActionId);
          if (action) {
            const obj = this.drawingService.getObjectByActionId(action!.data.actionId);
            if (obj) {
              const command = new RotateTranslateCompositeCommand();
              const translation = new TranslateCommand(this.rendererService.renderer, [obj]);
              if (!isActiveUser) {
                translation.translate(payload.xTranslation, payload.yTranslation);
              }
              command.addSubCommand(translation);
              this.pendingExternalCommands.set(payload.actionId, command);
            }
          }
        } else {
          const action = this.collaborationService.getActionById(payload.selectedActionId);
          if (action) {
            const obj = this.drawingService.getObjectByActionId(action.data.actionId);
            if (obj) {
              const translationCommand = ongoingAction.subCommand[0] as TranslateCommand;
              const prevX = translationCommand.lastXTranslate;
              const prevY = translationCommand.lastYTranslate;
              if (!isActiveUser) {
                translationCommand.translate(prevX + payload.xTranslation, prevY + payload.yTranslation);
              }
            }
          }
        }
      } else if (payload.state === DrawingState.up) {
        const command = this.pendingExternalCommands.get(payload.actionId) as RotateTranslateCompositeCommand;
        this.addOrUpdateCollaboration(payload.userId, { data: payload, command, isUndone: false })
      }
    },
    Rotate: () => {
      return;
    },
    Resize: (payload: IResizePayload) => {

      return;
    },
    UndoRedo: (payload: IDefaultActionPayload & IUndoRedoAction) => {
      const isActiveUser: boolean = (this.syncService.defaultPayload!.userId === payload.userId);
      if (payload.isUndo) {
        this.collaborationService.undoUserAction(
          payload.userId,
          payload.actionId,
          isActiveUser
        );
      } else {
        this.collaborationService.redoUserAction(
          payload.userId,
          payload.actionId,
          isActiveUser
        );
      }
    },
    Layer: () => {
      return;
    },
    Text: () => {
      return
    },
    'Save': (payload: { collaborationId: string, actionId: string, userId: string, actionType: string }) => {
      this.syncService.sendSelect(this.selectionService['selectedActionId'], false);
      this.syncService.sendSelect(payload.actionId, true);
    },
  };

  constructor(
    private rendererService: RendererProviderService,
    private drawingService: DrawingService,
    private selectionService: SelectionToolService,
    private collaborationService: CollaborationService,
    private syncService: SyncDrawingService
  ) { }

  create(payload: IAction): ICommand | null {
    const callback = this.tools[payload.actionType];
    if (callback) {
      return callback(payload);
    } else return null;
  }

  handleEvent(payload: IAction): ICommand | null {
    return this.create(payload);
  }

  addOrUpdateCollaboration(userId: string, payload: { data: IAction, command: ICommand, isUndone: boolean }) {
    this.collaborationService.addUser(userId);
    this.collaborationService.addActionToUser(userId, payload);
    this.pendingExternalCommands.delete(payload.data.actionId);
  }

}
