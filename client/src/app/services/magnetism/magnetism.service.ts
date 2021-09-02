import { Injectable } from '@angular/core';
import { Point } from 'src/app/model/point.model';
import { OffsetManagerService } from '../offset-manager/offset-manager.service';
import { GridService } from '../tools/grid-tool/grid.service';

@Injectable({
  providedIn: 'root',
})
export class MagnetismService {

  private totalMovementX = 0;
  private totalMovementY = 0;
  private setMagnetismAfterToggle: boolean;
  private xPrevPositionOfAnchor = 0;
  private yPrevPositionOfAnchor = 0;

  constructor(private offsetManager: OffsetManagerService, private gridService: GridService) { }

  offsetCoordMagnetismFromPoint(pointX: number, pointY: number): Point {
    const xPositionInGridCell = pointX % this.gridService.sizeCell.value;
    const yPositionInGridCell = pointY % this.gridService.sizeCell.value;
    const comparaisonValue = this.gridService.sizeCell.value / 2;
    let x = pointX;
    let y = pointY;
    if (xPositionInGridCell >= comparaisonValue) {
      x += (this.gridService.sizeCell.value - xPositionInGridCell);
    } else {
      x -= xPositionInGridCell;
    }
    if (yPositionInGridCell >= comparaisonValue) {
      y += (this.gridService.sizeCell.value - yPositionInGridCell);
    } else {
      y -= yPositionInGridCell;
    }
    return { x, y };
  }

  movementCoordOfMagnetism(event: MouseEvent, x: number, y: number): {movementX: number, movementY: number }  {
    const halfGridSizeCell = this.gridService.sizeCell.value / 2;
    this.totalMovementX += event.movementX;
    this.totalMovementY += event.movementY;
    const offset = this.offsetManager.offsetFromMouseEvent(event);
    const offsetMagnetism = this.offsetCoordMagnetismFromPoint(offset.x, offset.y);
    let movementX = 0;
    let movementY = 0;
    if (Math.abs(this.totalMovementX) >= halfGridSizeCell || Math.abs(this.totalMovementY) >= halfGridSizeCell) {
      movementX = offsetMagnetism.x - x;
      movementY = offsetMagnetism.y - y;
    }
    return { movementX, movementY };
  }

  // tslint:disable-next-line: max-line-length
  movementMagnetism(event: MouseEvent, anchorPointX: number, anchorPointY: number, firstMovementMagnetism: boolean): {movementX: number, movementY: number }  {
    let movementX = 0;
    let movementY = 0;
    if (firstMovementMagnetism || this.setMagnetismAfterToggle) {
      const offsetCoordMagnetism = this.offsetCoordMagnetismFromPoint(anchorPointX, anchorPointY);
      movementX = offsetCoordMagnetism.x - anchorPointX;
      movementY = offsetCoordMagnetism.y - anchorPointY;
      this.setMagnetismAfterToggle = false;
      this.xPrevPositionOfAnchor = offsetCoordMagnetism.x;
      this.yPrevPositionOfAnchor = offsetCoordMagnetism.y;
      return { movementX, movementY };
    } else {
      const movementCoordMagnetism = this.movementCoordOfMagnetism(event, this.xPrevPositionOfAnchor, this.yPrevPositionOfAnchor);
      movementX = movementCoordMagnetism.movementX;
      movementY = movementCoordMagnetism.movementY;
      this.xPrevPositionOfAnchor += movementX;
      this.yPrevPositionOfAnchor += movementY;
      return { movementX, movementY };
    }
  }

  toggleMagnetism(): void {
    this.gridService.activateMagnetism.setValue(!this.gridService.activateMagnetism.value);
    this.setMagnetismAfterToggle = true;
  }
}
