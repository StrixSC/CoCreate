import { Point } from 'src/app/model/point.model';

export interface Line {
    diameter: number;
    markerId: number;
    pointsList: Point[];
    strokeWidth: number;
    fill: string;
    stroke: string;
    fillOpacity: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeDasharray: string;
    markerVisibility: string;
}
