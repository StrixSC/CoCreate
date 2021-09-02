
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DrawingService } from '../../drawing/drawing.service';
import { RendererProviderService } from '../../renderer-provider/renderer-provider.service';
import { INITIAL_ANCHOR_POINT, INITIAL_CELL_SIZE, INITIAL_TRANSPARENCE } from '../tools-constants';

/// Service permettant de configurer et afficher la grille
@Injectable({
    providedIn: 'root',
})
export class GridService {

    readonly toolName = 'Grille';
    parameters: FormGroup;
    sizeCell: FormControl;
    activateGrid: FormControl;
    transparence: FormControl;
    activateMagnetism: FormControl;
    anchorPointMagnetism: FormControl;
    color: FormControl;
    object: SVGLineElement | null;
    rect: SVGRectElement;
    path: SVGPathElement;
    pattern: SVGPatternElement;

    private overallRect: SVGRectElement;
    private grid: SVGDefsElement;

    constructor(
        private drawingService: DrawingService,
        private rendererService: RendererProviderService,
    ) {
        this.sizeCell = new FormControl(INITIAL_CELL_SIZE, Validators.min(1));
        this.transparence = new FormControl(INITIAL_TRANSPARENCE, Validators.min(0.1));
        this.activateGrid = new FormControl(false);
        this.activateMagnetism = new FormControl(false);
        this.anchorPointMagnetism = new FormControl(INITIAL_ANCHOR_POINT, Validators.min(1));
        this.color = new FormControl('black');
        this.parameters = new FormGroup({
            sizeCell: this.sizeCell,
            transparence: this.transparence,
            activateGrid: this.activateGrid,
            color: this.color,
            activateMagnetism: this.activateMagnetism,
            anchorPointMagnetism: this.anchorPointMagnetism,
        });

        this.createPatternGrid();
        this.drawingService.drawingEmit.subscribe(() => {
            this.rendererService.renderer.setAttribute(this.overallRect, 'width', `${this.drawingService.width}px`);
            this.rendererService.renderer.setAttribute(this.overallRect, 'height', `${this.drawingService.height}px`);
            this.rendererService.renderer.appendChild(this.drawingService.drawing, this.overallRect);
            this.rendererService.renderer.appendChild(this.drawingService.drawing, this.grid);
        });
        this.parameters.valueChanges.subscribe(() => {
            this.changeGridSize();
            this.changeOpacity();
            this.changeColor();
            this.setGridVisibility();
        });
    }

    /// Genere le pattern pour la grille
    createPatternGrid(): void {
        this.grid = this.rendererService.renderer.createElement('defs', 'svg');
        this.rendererService.renderer.setAttribute(this.grid, 'pointer-events', 'none');
        this.rendererService.renderer.setProperty(this.grid, 'id', 'gridDefs');

        this.pattern = this.rendererService.renderer.createElement('pattern', 'svg');
        this.rendererService.renderer.setProperty(this.pattern, 'id', 'gridPattern');
        this.rendererService.renderer.setAttribute(this.pattern, 'width', (this.sizeCell.value).toString() + 'px');
        this.rendererService.renderer.setAttribute(this.pattern, 'height', (this.sizeCell.value).toString() + 'px');
        this.rendererService.renderer.setAttribute(this.pattern, 'patternUnits', 'userSpaceOnUse');
        this.rendererService.renderer.setAttribute(this.pattern, 'x', '0px');
        this.rendererService.renderer.setAttribute(this.pattern, 'y', '0px');
        this.rendererService.renderer.setAttribute(this.pattern, 'pointer-events', 'none');

        this.rect = this.rendererService.renderer.createElement('rect', 'svg');
        this.rendererService.renderer.setAttribute(this.rect, 'x', '0px');
        this.rendererService.renderer.setAttribute(this.rect, 'y', '0px');
        this.rendererService.renderer.setAttribute(this.rect, 'width', this.sizeCell.value.toString() + 'px');
        this.rendererService.renderer.setAttribute(this.rect, 'height', this.sizeCell.value.toString() + 'px');
        this.rendererService.renderer.setAttribute(this.rect, 'pointer-events', 'none');
        this.setStyle();
        this.rendererService.renderer.appendChild(this.grid, this.pattern);

        this.rendererService.renderer.appendChild(this.pattern, this.rect);

        this.overallRect = this.rendererService.renderer.createElement('rect', 'svg');

        this.rendererService.renderer.setStyle(this.overallRect, 'fill', 'url(#gridPattern)');
        this.rendererService.renderer.setAttribute(this.overallRect, 'pointer-events', 'none');
        this.rendererService.renderer.setAttribute(this.overallRect, 'id', 'gridRect');
    }

    /// Permet d'attribuer le style a la grille
    private setStyle(): void {
        this.rendererService.renderer.setStyle(this.rect, 'fill', 'none');
        this.rendererService.renderer.setStyle(this.rect, 'stroke', this.color.value);
        this.rendererService.renderer.setStyle(this.rect, 'stroke-width', '1px');
        this.rendererService.renderer.setStyle(this.rect, 'stroke-opacity', this.transparence.value.toString());
        this.setGridVisibility();
    }

    /// Permet d'alterner l'affichage de la grille
    toggleGrid(): void {
        this.activateGrid.setValue(!this.activateGrid.value);
    }

    setGridVisibility(): void {
        this.rendererService.renderer.setStyle(this.rect, 'visibility', this.activateGrid.value ? 'visible' : 'hidden');
    }

    /// Change le format de la grille
    changeGridSize(): void {
        this.rendererService.renderer.setAttribute(this.pattern, 'width', (this.sizeCell.value).toString() + 'px');
        this.rendererService.renderer.setAttribute(this.pattern, 'height', (this.sizeCell.value).toString() + 'px');
        this.rendererService.renderer.setAttribute(this.rect, 'width', this.sizeCell.value.toString() + 'px');
        this.rendererService.renderer.setAttribute(this.rect, 'height', this.sizeCell.value.toString() + 'px');
    }

    /// Change l'opacité de la grille
    changeOpacity(): void {
        this.rendererService.renderer.setStyle(this.rect, 'stroke-opacity', this.transparence.value.toString());
    }

    /// Change la couleur de la grille
    changeColor(): void {
        this.rendererService.renderer.setStyle(this.rect, 'stroke', this.color.value);
    }
}
