import { Point } from 'src/app/model/point.model';

export interface Spray {
    pointsList: Point[];
    radius: number;
    fill: string;
    stroke: string;
    fillOpacity: string;
    strokeOpacity: string;
 }
