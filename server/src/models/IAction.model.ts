export enum DrawingState {
    Move = 'move',
    Down = 'down',
    Up = 'up'
}

export enum ShapeType {
    Rectangle = 'RECTANGLE',
    Ellipse = 'Ellipse'
}

export interface IAction {
    actionId: string;
    userId: string;
    username: string;
    isSelected: boolean;
    timestamp: number;
    drawingId: string;
    state: DrawingState;
}

export interface IShapeAction extends IAction {
    x: number;
    y: number;
    isFilled: boolean;
    fillColor: number;
    color: number;
    width: number;
    shapeType: ShapeType;
}

export interface IFreedrawAction extends IAction {
    x: number;
    y: number;
    color: number;
    width: number;
}
