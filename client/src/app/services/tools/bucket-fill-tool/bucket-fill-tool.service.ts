import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { faFill, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ICommand } from 'src/app/interfaces/command.interface';
import { Point } from 'src/app/model/point.model';
import { RGB, RGB_MAX_VALUE } from 'src/app/model/rgb.model';
import { RGBA } from 'src/app/model/rgba.model';
import { CommandInvokerService } from '../../command-invoker/command-invoker.service';
import { DrawingService } from '../../drawing/drawing.service';
import { OffsetManagerService } from '../../offset-manager/offset-manager.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { ToolsColorService } from '../../tools-color/tools-color.service';
import { GridService } from '../grid-tool/grid.service';
import { Tools } from '../../../interfaces/tools.interface';
import { ToolIdConstants } from '../tool-id-constants';
import { LEFT_CLICK, RIGHT_CLICK } from '../tools-constants';
import { BucketFillCommand } from './bucket-fill-command';
import { BucketFill } from './bucket-fill.model';

const IMAGE_DATA_POSITION_OFFSET = 4;
const TOLERANCE_CAP = 195075;
const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;
const A_OFFSET = 3;

const FIFTEEN_SECONDS = 15000;

/// Service de l'outil pinceau, permet de créer des polyline en svg
/// Il est possible d'ajuster le stroke width et la texture
@Injectable({
    providedIn: 'root',
})
export class BucketFillToolService implements Tools {
    readonly id = ToolIdConstants.FILLER_ID;
    readonly faIcon: IconDefinition = faFill;
    readonly toolName = 'Outil Remplissage';
    parameters: FormGroup;
    private tolerance: FormControl;
    private ctx: CanvasRenderingContext2D;
    private xmlSerializer: XMLSerializer;

    constructor(
        private drawingService: DrawingService,
        private offsetManager: OffsetManagerService,
        private colorTool: ToolsColorService,
        private rendererProviderService: RendererProviderService,
        private commandInvoker: CommandInvokerService,
        private gridService: GridService,
        private snackBar: MatSnackBar,

    ) {
        this.xmlSerializer = new XMLSerializer();
        this.tolerance = new FormControl(0, [Validators.min(0), Validators.max(100)]);
        this.parameters = new FormGroup(
            {
                tolerance: this.tolerance,
            },
        );
    }

    async onPressed(event: MouseEvent): Promise<void> {

        return new Promise<void>((res, rej) => {

            if (event.button === RIGHT_CLICK || event.button === LEFT_CLICK) {
                const snackBarRef = this.snackBar.open(
                    'L\'outil remplissage est en train de remplire votre région', undefined, { duration: FIFTEEN_SECONDS });
                const offset: Point = this.offsetManager.offsetFromMouseEvent(event);
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                canvas.setAttribute('crossorigin', 'anonymous');

                this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                this.ctx.canvas.width = this.drawingService.width;
                this.ctx.canvas.height = this.drawingService.height;
                const isGridActivated = this.gridService.activateGrid.value;

                // exclure la grille du svg
                this.gridService.activateGrid.setValue(false);
                const stringSVG: string = this.xmlSerializer.serializeToString(this.drawingService.drawing);

                this.gridService.activateGrid.setValue(isGridActivated);
                const domURL = window.URL;
                const img: HTMLImageElement = new Image();
                const svgBlob: Blob = new Blob([stringSVG], { type: 'image/svg+xml;charset=utf-8' });
                const url: string = domURL.createObjectURL(svgBlob);

                img.onload = (() => {
                    this.ctx.drawImage(img, 0, 0);
                    const imageData: ImageData = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
                    const floodResult: { imgData: ImageData, min: Point, max: Point } = this.flood(
                        imageData,
                        offset,
                        this.getPixelColor(imageData, offset),
                        {
                            rgb: event.button === LEFT_CLICK ? this.colorTool.primaryColor : this.colorTool.secondaryColor,
                            a: event.button === LEFT_CLICK ? this.colorTool.primaryAlpha : this.colorTool.secondaryAlpha,
                        },
                    );
                    this.ctx.canvas.width = floodResult.max.x - floodResult.min.x;
                    this.ctx.canvas.height = floodResult.max.y - floodResult.min.y;
                    this.ctx.putImageData(floodResult.imgData, -floodResult.min.x, -floodResult.min.y);
                    domURL.revokeObjectURL(url);
                    const bucketFill: BucketFill = {
                        x: floodResult.min.x,
                        y: floodResult.min.y,
                        width: (floodResult.max.x - floodResult.min.x),
                        height: (floodResult.max.y - floodResult.min.y),
                        href: canvas.toDataURL(),
                    };
                    const command: BucketFillCommand = new BucketFillCommand(
                        this.rendererProviderService.renderer,
                        bucketFill,
                        this.drawingService);

                    this.commandInvoker.executeCommand(command);
                    snackBarRef.dismiss();
                    res();
                });
                img.src = url;
            } else {
                res();
            }

        });

    }

    onRelease(event: MouseEvent): void | ICommand {
        return;
    }

    onMove(event: MouseEvent): void {
        return;
    }

    onKeyUp(event: KeyboardEvent): void {
        return;
    }
    onKeyDown(event: KeyboardEvent): void {
        return;
    }
    pickupTool(): void {
        return;
    }
    dropTool(): void {
        return;
    }

    private flood(imageData: ImageData, point: Point, targetColor: RGB, fillColor: RGBA): { imgData: ImageData, min: Point, max: Point } {
        const max = { x: point.x, y: point.y };
        const min = { x: point.x, y: point.y };
        const width = this.drawingService.width;
        const height = this.drawingService.height;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        const imageDataToReturn: ImageData = ctx.getImageData(0, 0, width, height);
        const currentColor: RGB = this.getPixelColor(imageData, point);
        if (this.colorMatch(currentColor, fillColor.rgb, 0)) {
            return { imgData: imageDataToReturn, min, max };
        }
        const toVisit: Point[] = [];
        const visited: Set<string> = new Set<string>();
        toVisit.push(point);
        let currentPoint: Point = point;
        this.changePixelColor(imageDataToReturn, point, fillColor);
        visited.add(point.x + '_' + point.y);
        while (toVisit.length > 0) {
            currentPoint = toVisit.pop() as Point;
            max.x = Math.max(max.x, currentPoint.x);
            max.y = Math.max(max.y, currentPoint.y);
            min.x = Math.min(min.x, currentPoint.x);
            min.y = Math.min(min.y, currentPoint.y);

            for (let offset = -1; offset <= 1; offset += 2) {
                const xOffset = currentPoint.x + offset;
                const yOffset = currentPoint.y + offset
                if (this.isInDrawing(xOffset, currentPoint.y, width, height)
                    && !visited.has((xOffset) + '_' + (currentPoint.y))
                    && this.colorMatch(this.getPixelColor(imageData, { x: currentPoint.x + offset, y: currentPoint.y }), targetColor)) {
                    toVisit.push({ x: xOffset, y: currentPoint.y });
                    this.changePixelColor(imageDataToReturn, { x: xOffset, y: currentPoint.y }, fillColor);
                    visited.add(xOffset + '_' + currentPoint.y);
                }
                if (this.isInDrawing(currentPoint.x, yOffset, width, height)
                    && !visited.has((currentPoint.x) + '_' + (yOffset))
                    && this.colorMatch(this.getPixelColor(imageData, { x: currentPoint.x, y: yOffset }), targetColor)) {
                    toVisit.push({ x: currentPoint.x, y: yOffset });
                    this.changePixelColor(imageDataToReturn, { x: currentPoint.x, y: yOffset }, fillColor);
                    visited.add(currentPoint.x + '_' + yOffset);
                }
            }
        }
        return { imgData: imageDataToReturn, min, max };
    }

    private isInDrawing(x: number, y: number, width: number, height: number): boolean {
        return x >= 0 && x <= width && y >= 0 && y <= height;
    }

    private getPixelColor(imageData: ImageData, point: Point): RGB {
        const offsetImage: number = this.offsetCalculator(point, imageData);
        return {
            r: imageData.data[offsetImage + R_OFFSET],
            g: imageData.data[offsetImage + G_OFFSET],
            b: imageData.data[offsetImage + B_OFFSET],
        };
    }

    private colorMatch(color1: RGB, color2: RGB, tolerance: number = this.tolerance.value): boolean {
        const colorDistance: number =
            Math.pow(color1.r - color2.r, 2) + Math.pow(color1.g - color2.g, 2) + Math.pow(color1.b - color2.b, 2);
        return colorDistance <= TOLERANCE_CAP * tolerance / 100;
    }

    private changePixelColor(imageData: ImageData, point: Point, changeColor: RGBA): void {
        const offsetImage: number = this.offsetCalculator(point, imageData);
        imageData.data[offsetImage + R_OFFSET] = changeColor.rgb.r;
        imageData.data[offsetImage + G_OFFSET] = changeColor.rgb.g;
        imageData.data[offsetImage + B_OFFSET] = changeColor.rgb.b;
        imageData.data[offsetImage + A_OFFSET] = Math.ceil(changeColor.a * RGB_MAX_VALUE);
    }

    private offsetCalculator(point: Point, imageData: ImageData): number {
        return (point.y * imageData.width + point.x) * IMAGE_DATA_POSITION_OFFSET;
    }
}
