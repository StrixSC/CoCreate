import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SocketService } from '../chat/socket.service';
import { SyncCollaborationService } from '../syncCollaboration.service';
import { WorkspaceService } from '../workspace/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class CollaborationPasswordFormService {


  form: FormGroup;
  private isSizeModified = false;

  constructor(
    private formBuilder: FormBuilder,
    private syncCollaborationService: SyncCollaborationService
  ) {
    this.form = this.formBuilder.group(
      {password: this.formBuilder.control('',Validators.required),
    });
    //this.form.updateValueAndValidity;
  }
}
