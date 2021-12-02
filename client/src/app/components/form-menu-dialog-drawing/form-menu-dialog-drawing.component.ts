import { IGalleryEntry } from '../../model/IGalleryEntry.model';
import {OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationCreatePayload, ICollaborationDeletePayload, ICollaborationLeavePayload, ICollaborationUpdatePayload } from '../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

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
  selectedUpdate: string = '';
  public updateOption =
  ['Titre','Type','Auteur'
  ];
  public visibilityTypes: { key: string, value: string }[] =
    [
      {
        key: DrawingType.Public,
        value: "Public",
      },
      {
        key: DrawingType.Private,
        value: "Privé",
      },
      {
        key: DrawingType.Protected,
        value: "Protégé"
      }
    ];
  updateForm: FormGroup;

  public authors: { key: string, value: string }[] = [];

  
  public constructor(
    private syncCollaborationService: SyncCollaborationService,
    public dialogRef: MatDialogRef<FormMenuDialogDrawingComponent>,
    private snackbar: MatSnackBar,
    
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public drawing: any,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
      this.exceptionSubscription = this.syncCollaborationService.onCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.isLoading = false;
    } );
    this.authors = [
      {
        key: this.auth.activeUser!.uid,
        value: `${this.auth.activeUser!.displayName} (Moi)`
      }
      // TODO: Add fetch for teams.
    ];
    


    this.updateForm = this.fb.group({
      option: ['', [
        Validators.required,
      ]],
      author: ['', [
      ]],
      title: ['', [
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      type: ['', [
      ]],
      password: ['', [
      ]]
    });
  }

  get option(): any {
    return this.updateForm.get('option');
  }

  get author(): any {
    return this.updateForm.get('author');
  }

  get password(): any {
    return this.updateForm.get('password');
  }

  get title(): any {
    return this.updateForm.get('title');
  }

  get type(): any {
    return this.updateForm.get('type');
  }

  sendDeleteCollaboration() {
    if(this.drawing!==null && this.drawing['action']==="Delete"){
    let data =  {
    collaborationId: this.drawing['drawing'].collaboration_id
    } as ICollaborationDeletePayload
    this.syncCollaborationService.sendDeleteCollaboration(data)
    this.dialogRef.close();
    }
  }

  sendLeaveCollaboration() {
    if(this.drawing!==null && this.drawing['action']==="Leave"){
    let data =  {
    collaborationId: this.drawing['drawing'].collaboration_id
    } as ICollaborationLeavePayload
    this.syncCollaborationService.sendLeaveCollaboration(data)
    this.dialogRef.close();
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.updateForm.valid && this.auth.activeUser) {
      this.updateForm.disable();
      this.isLoading = true;
      const payload = {


      collaborationId: this.drawing['drawing'].collaboration_id,
   

        userId: this.auth.activeUser.uid,
        title: this.title.value,
        type: this.type.value,
        password: this.password.value,
      } as ICollaborationUpdatePayload
      this.syncCollaborationService.sendUpdateCollaboration(payload);
    }
  }

}
