import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { OpenDrawingComponent } from 'src/app/components/open-drawing/open-drawing.component';

@Injectable({
  providedIn: 'root',
})
export class OpenDrawingDialogService {

  constructor(public dialog: MatDialog) { }

  openDialog(): void {
    this.dialog.open(OpenDrawingComponent, {
      width: '650px',
      autoFocus: false,
      disableClose: true,
    });
  }
}
