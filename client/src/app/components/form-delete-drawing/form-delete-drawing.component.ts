import { IGalleryEntry } from './../../model/IGalleryEntry.model';
import {OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationDeletePayload } from './../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-delete-drawing',
  templateUrl: './form-delete-drawing.component.html',
  styleUrls: ['./form-delete-drawing.component.scss']
})
export class FormDeleteDrawingComponent implements OnInit {


  selectedType: string;
  showPassword: boolean;
  exceptionSubscription: Subscription;
  isLoading: boolean;
  
  public constructor(
    private syncCollaborationService: SyncCollaborationService,
    public dialogRef: MatDialogRef<FormDeleteDrawingComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public drawing: IGalleryEntry | null,
  ) {
  }

  ngOnInit(): void {
      this.exceptionSubscription = this.syncCollaborationService.onCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.isLoading = false;
    });
    console.log(this.drawing)
  }

  sendDeleteCollaboration() {
    if(this.drawing!==null){
    let data =  {
    collaborationId: this.drawing.collaboration_id
    } as ICollaborationDeletePayload
    this.syncCollaborationService.sendDeleteCollaboration(data)
    this.dialogRef.close();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
