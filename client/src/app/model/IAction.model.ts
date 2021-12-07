import { Point } from 'src/app/model/point.model';

export type Action = {
    index: number
    dbActionId: string
    createdAt: Date
    updatedAt: Date
    actionId: string
    username: string
    userId: string
    collaborationId: string
    actionType: ActionType
    x: number | null
    y: number | null
    r: number | null
    g: number | null
    b: number | null
    a: number | null
    width: number | null
    offsets: string | null
    x2: number | null
    y2: number | null
    rFill: number | null
    gFill: number | null
    bFill: number | null
    aFill: number | null
    shapeType: ShapeType | null
    shapeStyle: ShapeStyle | null
    selectedActionId: string
    xTranslation: number | null
    yTranslation: number | null
    xScale: number | null
    yScale: number | null
    angle: number | null
    state: DrawingState | null
    isSelected: boolean | null
    selectedBy: string
    isUndoRedo: boolean | null
}

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
    actionType: ActionType;
    isUndoRedo?: boolean;
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
    offsets: Point[]
}

export type IFreedrawUpLoadAction = IFreedrawAction & {
    offsets: string;
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
    selectedActionId?: string;
}

export type IAction = IDefaultActionPayload & (
    IFreedrawAction
    | IShapeAction
    | ISelectionAction
    | IUndoRedoAction
    | ITranslateAction
    | IDeleteAction
    | IResizeAction
    | IRotateAction
    | ISaveAction
);

export type ITranslateAction = IDefaultActionPayload & {
    xTranslation: number;
    state: DrawingState;
    yTranslation: number;
    selectedActionId: string;
}

export type IDeleteAction = IDefaultActionPayload & {
    selectedActionId: string;
}

export type IResizeAction = IDefaultActionPayload & {
    xScale: number;
    yScale: number;
    xTranslation: number;
    yTranslation: number;
    state: DrawingState;
    selectedActionId: string;
}

export type IRotateAction = IDefaultActionPayload & {
    angle: number;

    x?: number;
    y?: number;
    state: DrawingState;
    selectedActionId: string;
}

export type ISaveAction = IDefaultActionPayload &
{
    collaborationId: string,
    actionId: string,
    userId: string,
    actionType: string,
    isUndoRedo: boolean
}
export type ISelectionBasedAction = IDeleteAction & ITranslateAction & IRotateAction & IResizeAction;
