import { AuthService } from 'src/app/services/auth.service';
import { DeleteConfirmationDialogComponent } from './../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { UpdateCollaborationFormDialogComponent } from './../update-collaboration-form-dialog/update-collaboration-form-dialog.component';
import { DrawingLoadService } from './../../services/drawing-load.service';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ICollaborationLoadResponse } from './../../model/ICollaboration.model';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawingPreviewDialogComponent } from '../drawing-preview-dialog/drawing-preview-dialog.component';
import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import { CollaborationPasswordFormDialogComponent } from '../collaboration-password-form-dialog/collaboration-password-form-dialog.component';

@Component({
  selector: 'app-drawing-gallery-card',
  templateUrl: './drawing-gallery-card.component.html',
  styleUrls: ['./drawing-gallery-card.component.scss']
})
export class DrawingGalleryCardComponent {

  private loadSubscription: Subscription;
  dialogRef: MatDialogRef<DrawingPreviewDialogComponent | CollaborationPasswordFormDialogComponent>
  @Input() public drawing: IGalleryEntry;
  constructor(
    private syncService: SyncCollaborationService,
    private router: Router,
    public dialog: MatDialog,
    private auth: AuthService,
    private drawingLoader: DrawingLoadService
  ) { }

  ngOnInit(): void {
    this.loadSubscription = this.syncService.onLoadCollaboration().subscribe((data) => {
      if (data) {
        this.onLoad(data)
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe()
    }
  }

  openDialog(): void {

    if (this.drawing.type !== "Protected" || (this.drawing.type === "Protected" && this.drawing.is_member)) {
      this.dialogRef = this.dialog.open(DrawingPreviewDialogComponent,
        {
          data: this.drawing
        });
    }
    else if (this.drawing.type === "Protected") {
      this.dialogRef = this.dialog.open(CollaborationPasswordFormDialogComponent,
        {
          data: this.drawing
        });
    }

  }

  onLoad(data: ICollaborationLoadResponse) {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.drawingLoader.activeDrawingData = data;
      this.router.navigateByUrl(`drawing/${this.drawing.collaboration_id}`);
    }
  }

  openLeaveDeleteDialog(isDelete: boolean): void {
    this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '500px',
      data: {
        message: `Êtes vous sûr de vouloir ${isDelete ? 'supprimer' : 'quitter'} le dessin "${this.drawing.title}" ?`,
        submessage: isDelete ? 'Cette action est irréversible...' : '',
        buttonLabel: isDelete ? 'Supprimer' : 'Quitter'
      }
    }).afterClosed().subscribe((d) => {
      if (d) {
        if (isDelete) {
          this.syncService.sendDeleteCollaboration({ collaborationId: this.drawing.collaboration_id!, userId: this.auth.activeUser!.uid });
        } else {
          this.syncService.sendLeaveCollaboration({ collaborationId: this.drawing.collaboration_id!, userId: this.auth.activeUser!.uid });
        }
      }
    });
  }

  openUpdate(): void {
    this.dialog.open(UpdateCollaborationFormDialogComponent, { data: this.drawing });
  }
}
