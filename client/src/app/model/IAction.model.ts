import { Point } from 'src/app/model/point.model';

export enum DrawingState {
    move = 'move',
    up = 'up',
    down = 'down'
}

export enum ShapeType {
    Rectangle = "Rectangle",
    Ellipse = "Ellipse"
}

export enum ShapeStyle {
    Center = "center",
    Border = "border",
    fill = "fill"
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
    x: number;
    y: number;
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
    state: DrawingState;
    shapeType: ShapeType;
    shapeStyle: ShapeStyle;
}

export type ISelectionAction = IDefaultActionPayload & {
    isSelected: boolean;
    selectedBy?: string;
    state: DrawingState
}

export type IUndoRedoAction = IDefaultActionPayload & {
    isUndo: boolean;
}

export type IAction = IDefaultActionPayload & (
    IFreedrawAction
    | IShapeAction
    | ISelectionAction
    | IUndoRedoAction
    | ITranslateAction
    | IDeleteAction
    | IResizePayload
);

export type ITranslateAction = IDefaultActionPayload & {
    xTranslate: number;
    state: DrawingState;
    yTranslate: number;
    selectedActionId: string;
}

export type IDeleteAction = IDefaultActionPayload & {
    selectedActionId: string;
}

export type IResizePayload = IDefaultActionPayload & {
    xScale: number;
    state: DrawingState;
    yScale: number;
    selectedActionId: number;
}