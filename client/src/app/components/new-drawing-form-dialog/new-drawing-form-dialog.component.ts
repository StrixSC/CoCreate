import { IGalleryEntry } from './../../model/IGalleryEntry.model';
import { OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationCreatePayload } from './../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { AuthService } from './../../services/auth.service';
import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingType } from 'src/app/model/drawing-visibility.model';
import { ColorPickerService } from 'src/app/color-picker/color-picker.service';

@Component({
  selector: 'app-new-drawing-form-dialog',
  templateUrl: './new-drawing-form-dialog.component.html',
  styleUrls: ['./new-drawing-form-dialog.component.scss']
})
export class NewDrawingFormDialogComponent implements OnInit, OnDestroy {
  selectedType: string;
  newDrawingForm: FormGroup;
  showPassword: boolean;
  exceptionSubscription: Subscription;
  isLoading: boolean;
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

  public authors: { key: string, value: string }[] = [];

  public constructor(
    private syncCollaborationService: SyncCollaborationService,
    private colorService: ColorPickerService,
    private auth: AuthService,
    public dialogRef: MatDialogRef<NewDrawingFormDialogComponent>,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public drawing: IGalleryEntry | null,
  ) {
  }

  ngOnInit(): void {
    this.newDrawingForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      author: ['', [
        Validators.required,
      ]],
      type: ['', [
        Validators.required,
      ]],
      password: ['', [
      ]],
      backgroundColor: this.colorService.colorForm
    });

    this.authors = [
      {
        key: this.auth.activeUser!.uid,
        value: `${this.auth.activeUser!.displayName} (Moi)`
      }
      // TODO: Add fetch for teams.
    ];

    this.exceptionSubscription = this.syncCollaborationService.onCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.newDrawingForm.enable();
      this.isLoading = false;
    });
  }

  sendCreateCollaboration(form: any) {
    console.log(form.author)
    let data : ICollaborationCreatePayload = {
      userId: form.author,
      title: form.title,
      type: form.type

    }
    this.syncCollaborationService.sendCreateCollaboration(data)
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  get author(): any {
    return this.newDrawingForm.get('author');
  }

  get password(): any {
    return this.newDrawingForm.get('password');
  }

  get title(): any {
    return this.newDrawingForm.get('title');
  }

  get type(): any {
    return this.newDrawingForm.get('type');
  }

  get backgroundColor(): any {
    return this.newDrawingForm.get('backgroundColor');
  }

  changeType(e: any) {
    if (this.type.value === DrawingType.Protected) {
      this.password.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]);
    } else {
      this.password.setValidators([]);
    }
  }

  onSubmit(): void {
    if (this.newDrawingForm.valid && this.auth.activeUser) {
      this.newDrawingForm.disable();
      this.isLoading = true;
      const payload = {
        title: this.title.value,
        type: this.type.value,
        password: this.password.value,
        userId: this.author.value
      } as ICollaborationCreatePayload
      this.syncCollaborationService.sendCreateCollaboration(payload);
    }
  }

  ngOnDestroy(): void {
    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }
  }
}
