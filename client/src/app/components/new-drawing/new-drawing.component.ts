import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';
import { DEFAULT_RGB_COLOR } from 'src/app/model/rgb.model';
import { DEFAULT_ALPHA } from 'src/app/model/rgba.model';
import { DrawingGalleryService } from 'src/app/services/drawing-gallery/drawing-gallery.service';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { NewDrawingService } from 'src/app/services/new-drawing/new-drawing.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
//import { GridService } from 'src/app/services/tools/grid-tool/grid.service';
import { NewDrawingAlertComponent } from './new-drawing-alert/new-drawing-alert.component';

const ONE_SECOND = 1000;
@Component({
  selector: 'app-new-drawing',
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
  providers: [
    NewDrawingService,
  ],
})
export class NewDrawingComponent implements OnInit {
  //@ViewChild ('form', {static: false}) form: FormGroup
  form: FormGroup;
  userID: string;
  constructor(
    public dialogRef: MatDialogRef<NewDrawingComponent>,
    private snackBar: MatSnackBar,
    private newDrawingService: NewDrawingService,
    private drawingService: DrawingService,
    private dialog: MatDialog,
    private colorPickerService: ColorPickerService,
    private router: Router,
    private drawingGalleryService: DrawingGalleryService,
    private syncCollaborationService: SyncCollaborationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    //private gridService: GridService,
  ) { 
    this.userID = data;
  }

  /// Créer un nouveau form avec les dimensions et la couleur
  ngOnInit(): void {
    this.form = new FormGroup(
      {
        drawingInformation: this.newDrawingService.form,
        color: this.colorPickerService.colorForm,
      },
    );
    this.dialogRef.disableClose = true;
    //this.dialogRef.afterOpened().subscribe(() => this.onResize());
    this.colorPickerService.setFormColor(DEFAULT_RGB_COLOR, DEFAULT_ALPHA);
  }

  get newDrawingForm(): FormGroup {
    return (this.form.get('drawingInformation') as FormGroup).get('size') as FormGroup;
  }

  /// Ouvre le dialog pour l'alerte lorsque le service est creer
  onAccept(form: any): void {
    let s: string = form['drawingInformation'].size.title as string;
    let p : string = form['drawingInformation'].size.type as string;
    if(p==="Protégé") { 
      p = "Protected"; 
      let pw: string = form['drawingInformation'].size.password as string;
      this.syncCollaborationService.sendCreateCollaboration(this.userID, s, p, pw);
    }
    else if (p==="Privé") {
      p = "Private";
      this.syncCollaborationService.sendCreateCollaboration(this.userID, s, p);
    }
    else if (p === "Public") {
      p = "Public";
      this.syncCollaborationService.sendCreateCollaboration(this.userID, s, p);
    }
    if (this.drawingService.isCreated) {
      const alert = this.dialog.open(NewDrawingAlertComponent, {
        role: 'alertdialog',
      });
      alert.afterClosed().subscribe((result: boolean) => {
        if (result) {
          //this.newDrawing();
        }
      });
    } else {
     // this.newDrawing();
    }

    this.snackBar.open('Nouveau dessin créé', '', { duration: ONE_SECOND, });
    this.newDrawingService.form.reset();
    this.dialogRef.close();
  }

  /// Cree un nouveau dessin
  private newDrawing() {
    
    console.log(this.form.value)
    //this.gridService.activateGrid.setValue(false);
    this.drawingService.isCreated = true;
    //const size: { width: 1280, height: 752 } = this.newDrawingService.drawingFormGroup.value;
    this.drawingService.newDrawing(
      1280,
      780,
      {
        rgb: this.colorPickerService.rgb.value,
        a: this.colorPickerService.a.value,
      },
    );
    this.snackBar.open('Nouveau dessin créé', '', { duration: ONE_SECOND, });
    this.newDrawingService.form.reset();
    this.dialogRef.close();
  }

  /// Ferme le dialogue
  onCancel(): void {
    this.dialogRef.close();
  }

  /// Ecoute pour un changement de la grandeur du window
  /*@HostListener('window:resize', ['$event'])
  onResize() {
    this.newDrawingService.onResize();
  }*/


}
