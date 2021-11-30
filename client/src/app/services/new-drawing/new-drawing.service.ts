import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';
import { SocketService } from '../chat/socket.service';
import { IGalleryEntry } from '../../model/IGalleryEntry.model'
import { SyncCollaborationService } from '../syncCollaboration.service';
/// Service pour créer des nouveau canvas de dessin
@Injectable({ providedIn: 'root' })
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
      size: this.formBuilder.group({
        title: this.formBuilder.control('', Validators.required),
        type: this.formBuilder.control('', Validators.required),
        author_username: this.formBuilder.control('', Validators.required),
        password: this.formBuilder.control('')
      }),
    });
    //this.form.updateValueAndValidity;
  }

  get drawingFormGroup(): FormGroup {
    return this.form.get('size') as FormGroup;
  }

  receiveMessage(): Observable<IGalleryEntry> {
    return this.socket.on('collaboration:created');
  }
}
