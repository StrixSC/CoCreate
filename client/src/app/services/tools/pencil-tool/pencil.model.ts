import { Point } from 'src/app/model/point.model';

export interface Pencil {
    pointsList: Point[];
    strokeWidth: number;
    fill: string;
    stroke: string;
    fillOpacity: string;
    strokeOpacity: string;
}
