import { Point } from 'src/app/model/point.model';

export enum DrawingState {
    'move',
    'up',
    'down'
}

export enum ActionType {
    Freedraw = 'Freedraw',
    Shape = 'Shape',
    Select = 'Select',
    Translate = 'Translate',
    Rotate = 'Rotate',
    Delete = 'Delete',
    Resize = 'Resize',
    Text = 'Text',
    Layer = 'Layer',
    UndoRedo = 'UndoRedo'
}

export interface IDefaultActionPayload {
    actionId: string;
    username: string;
    userId: string;
    collaborationId: string;
    actionType: ActionType
}

export type IFreedrawAction = ISelectionAction & IDefaultActionPayload & {
    x: number;
    y: number;
    r: number;
    g: number;
    b: number;
    a: number;
    width: number;
    state: DrawingState
}

export type IFreedrawUpAction = IFreedrawAction & {
    offsets: Point[];
}

export type IShapeAction = IDefaultActionPayload & ISelectionAction & {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    r: number;
    g: number;
    b: number;
    a: number;
    rFill: number;
    gFill: number;
    bFill: number;
    aFill: number;
    width: number;
    state: DrawingState
}

export type ISelectionAction = IDefaultActionPayload & {
    isSelected: boolean;
    state: DrawingState
}

export type IAction = IDefaultActionPayload & (
        IFreedrawAction
    |   IShapeAction  
    |   ISelectionAction
);
