import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';
import { SocketService } from '../chat/socket.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model'
import { SyncCollaborationService } from '../syncCollaboration';
/// Service pour créer des nouveau canvas de dessin
@Injectable({providedIn: 'root'})
export class NewDrawingService {

  form: FormGroup;
  private isSizeModified = false;

  constructor(
    private formBuilder: FormBuilder,
    private workspaceService: WorkspaceService,
    private socket: SocketService, 
    private syncCollaborationService: SyncCollaborationService
  ) {
    this.form = this.formBuilder.group({
      information: this.formBuilder.group({
        title: this.formBuilder.control('',Validators.required),
        type: this.formBuilder.control('',Validators.required),
        author_username: this.formBuilder.control('',Validators.required),
        password: this.formBuilder.control('')
      }),
    });
  }

  get drawingFormGroup(): FormGroup {
    return this.form.get('size') as FormGroup;
  }

  /// Réajuste le grandeur du workspace
  /*onResize(): void {
    if (!this.isSizeModified) {
      this.drawingFormGroup.setValue({ width: this.workspaceService.width, height: this.workspaceService.height });
    }
  }*/
   sendNewDrawingForm(): void {
     this.syncCollaborationService.sendCreateCollaboration('demo-dessin', 'Premier dessin', "Public");
  }

  receiveMessage(): Observable<IGalleryEntry> {
    return this.socket.on('collaboration:created');
  }
}
