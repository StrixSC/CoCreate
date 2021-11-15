import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { VisibilityType } from 'src/app/model/drawing-visibility.model';
import { Drawing1 } from '../../../../../common/communication/new-drawing-parameters';

@Component({
  selector: 'app-new-drawing-form-dialog',
  templateUrl: './new-drawing-form-dialog.component.html',
  styleUrls: ['./new-drawing-form-dialog.component.scss']
})
export class NewDrawingFormDialogComponent  {
  
    drawingNameControl = new FormControl('', Validators.required);
    selectVisibilityControl = new FormControl('', Validators.required);
    teamNameControl = new FormControl('', Validators.required);

    
    public visibilityTypes: String[];
    public teamNames: String[];
    public constructor(public dialogRef: MatDialogRef<NewDrawingFormDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,){
      
      this.visibilityTypes = [VisibilityType.public, VisibilityType.protected, VisibilityType.private]
      this.teamNames = ['Moi-même', 'Équipe de collaboration']
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
    
}




