export enum ActionTool {
  FREEDRAW = "FREEDRAW",
  SELECT = "SELECT",
  SHAPE_RECTANGLE = "SHAPE_RECTANGLE",
  SHAPE_ELLIPSE = "SHAPE_ELLIPSE",
  CHANGE_BG_COLOR = "CHANGE_BG_COLOR",
}

export interface IAction {
  actionId: string;
  type: ActionTool;
  userId: string;
  username: string;
  timestamp: number;
  x?: number;
  y?: number;
  color?: string;
  width?: number;
  fillColor?: string;
  isSelected?: boolean;
}
