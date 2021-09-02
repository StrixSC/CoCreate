import { Point } from 'src/app/model/point.model';
import { FilledShape } from '../tool-rectangle/filed-shape.model';

export interface Polygon extends FilledShape {
    pointsList: Point[];
}
