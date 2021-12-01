import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import {OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationDeletePayload, ICollaborationLeavePayload } from '../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-menu-dialog-drawing',
  templateUrl: './form-menu-dialog-drawing.component.html',
  styleUrls: ['./form-menu-dialog-drawing.component.scss']
})
export class FormMenuDialogDrawingComponent implements OnInit {


  selectedType: string;
  showPassword: boolean;
  exceptionSubscription: Subscription;
  isLoading: boolean;
  
  public constructor(
    private syncCollaborationService: SyncCollaborationService,
    public dialogRef: MatDialogRef<FormMenuDialogDrawingComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public drawing: any,
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
    if(this.drawing!==null && this.drawing['action']==="Delete"){
    let data =  {
    collaborationId: this.drawing['drawing'].collaboration_id
    } as ICollaborationDeletePayload
    console.log(data)
    this.syncCollaborationService.sendDeleteCollaboration(data)
    this.dialogRef.close();
    }
  }

  sendLeaveCollaboration() {
    if(this.drawing!==null && this.drawing['action']==="Leave"){
    let data =  {
    collaborationId: this.drawing['drawing'].collaboration_id
    } as ICollaborationLeavePayload
    console.log(data)
    this.syncCollaborationService.sendLeaveCollaboration(data)
    this.dialogRef.close();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}
