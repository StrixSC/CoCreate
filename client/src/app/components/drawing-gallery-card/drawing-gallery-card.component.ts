import { DrawingLoadService } from './../../services/drawing-load.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DrawingService } from 'src/app/services/drawing/drawing.service';
import { ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawingPreviewDialogComponent } from '../drawing-preview-dialog/drawing-preview-dialog.component';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';
import { FormMenuDialogDrawingComponent } from '../form-menu-dialog-drawing/form-menu-dialog-drawing.component';

@Component({
  selector: 'app-drawing-gallery-card',
  templateUrl: './drawing-gallery-card.component.html',
  styleUrls: ['./drawing-gallery-card.component.scss']
})
export class DrawingGalleryCardComponent {

  private loadSubscription: Subscription;
  dialogRef: MatDialogRef<DrawingPreviewDialogComponent | CollaborationPasswordFormDialogComponent>
  @Input() public drawing: IGalleryEntry;
  constructor(private syncService: SyncCollaborationService, private router: Router, public dialog: MatDialog, private drawingLoader: DrawingLoadService) { }

  ngOnInit(): void {
    this.loadSubscription = this.syncService.onLoadCollaboration().subscribe((data) => {
      if (data) {
        this.onLoad(data)
      }
    })
  }

  ngOnDestroy(): void {
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe()
    }
  }

  openDialog(): void {
    
      this.dialogRef = this.dialog.open(DrawingPreviewDialogComponent,
        {
          data: this.drawing
        });

  }

  onLoad(data: ICollaborationLoadResponse) {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.drawingLoader.activeDrawingData = data;
      this.router.navigateByUrl(`drawing/${this.drawing.collaboration_id}`);
    }
  }

  openDelete(): void {
    this.dialog.open(FormMenuDialogDrawingComponent, 
      {
      
        data: {drawing:this.drawing, action: "Delete"}
      
    });
  }
  openLeave(): void {
    this.dialog.open(FormMenuDialogDrawingComponent, 
      {
      
        data: {drawing:this.drawing, action: "Leave"}
      
    });
  }
  openUpdate(): void {
    this.dialog.open(FormMenuDialogDrawingComponent, 
      {
      
        data: {drawing:this.drawing, action: 'Update'}
      
    });
  }
}
