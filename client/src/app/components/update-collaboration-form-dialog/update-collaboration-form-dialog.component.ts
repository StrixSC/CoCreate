import { TeamService } from 'src/app/services/team.service';
import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IGalleryEntry } from './../../model/IGalleryEntry.model';
import { OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationCreatePayload, ICollaborationUpdatePayload } from './../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { AuthService } from './../../services/auth.service';
import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';

@Component({
  selector: 'app-update-collaboration-form-dialog',
  templateUrl: './update-collaboration-form-dialog.component.html',
  styleUrls: ['./update-collaboration-form-dialog.component.scss']
})
export class UpdateCollaborationFormDialogComponent implements OnInit, OnDestroy {
  selectedType: string;
  updateForm: FormGroup;
  showPassword: boolean;
  exceptionSubscription: Subscription;
  isLoading: boolean;
  updateSubscription: Subscription;
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

  public constructor(
    private syncCollaborationService: SyncCollaborationService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<UpdateCollaborationFormDialogComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public drawing: IGalleryEntry | null,
  ) { }

  ngOnInit(): void {
    if (!this.drawing) {
      this.dialogRef.close();
      this.snackbar.open('Erreur lors du traitement de la requête...', "OK", { duration: 5000 });
    }

    this.updateForm = this.fb.group({
      title: [this.drawing!.title, [
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      type: [this.drawing!.type],
      password: [''],
    });

    this.exceptionSubscription = this.syncCollaborationService.onUpdateException().subscribe((message: any) => {
      this.snackbar.open(message.message, 'OK', { duration: 5000 });
      this.updateForm.enable();
      this.isLoading = false;
    });

    this.updateSubscription = this.syncCollaborationService.onUpdateFinished().subscribe(() => {
      this.snackbar.open('Succès, le dessin à été mise à jour!', "OK", { duration: 5000 });
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.dialogRef.close();
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get password(): AbstractControl {
    return this.updateForm.get('password')!;
  }

  get title(): AbstractControl {
    return this.updateForm.get('title')!;
  }

  get type(): AbstractControl {
    return this.updateForm.get('type')!;
  }

  changeType(e: any) {
    if (this.type.value === DrawingType.Protected) {
      this.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]);
      this.password.updateValueAndValidity();
    } else {
      this.password.clearValidators();
      this.password.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.updateForm.disable();
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const payload = {
        userId: this.auth.activeUser!.uid,
        title: this.title.value,
        collaborationId: this.drawing!.collaboration_id,
        type: this.type.value,
        password: this.password.value,
      } as ICollaborationUpdatePayload
      this.syncCollaborationService.sendUpdateCollaboration(payload);
    }
  }

  isValid() {
    return this.updateForm.valid && this.auth.activeUser && this.infoChanged();
  }

  infoChanged(): boolean {
    let infoChanged = false;

    if (this.drawing!.title !== this.title.value) {
      infoChanged = true;
    }

    if (this.drawing!.type !== this.type.value) {
      infoChanged = true;
    }

    return infoChanged;
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe()
    }

    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }
  }
}
