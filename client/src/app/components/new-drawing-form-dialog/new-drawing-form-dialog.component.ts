import { TeamService } from 'src/app/services/team.service';
import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IGalleryEntry } from './../../model/IGalleryEntry.model';
import { OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ICollaborationCreatePayload } from './../../model/ICollaboration.model';
import { SyncCollaborationService } from 'src/app/services/syncCollaboration.service';
import { AuthService } from './../../services/auth.service';
import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
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
  finishSubscription: Subscription;
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
    private teamService: TeamService,
    private snackbar: MatSnackBar,
    private http: HttpClient,
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

    this.finishSubscription = this.syncCollaborationService.onCreateFinish().subscribe((c) => {
      this.isLoading = false;
      this.dialogRef.disableClose = false;
      this.snackbar.open('Dessin créé avec succès!', "OK", { duration: 5000 });
      this.dialogRef.close();
    })

    this.authors = []

    this.teamService.getAllUserTeams().subscribe((d: { teams: { teamName: string, teamId: string }[] }) => {
      const me = [{ key: this.auth.activeUser!.uid, value: `${this.auth.activeUser!.displayName} (Moi)` }];
      if (d && d.teams && d.teams.length >= 1) {
        this.authors = me.concat((d.teams.map((t) => ({ key: t.teamId, value: t.teamName + ' (Équipe)' }))));
      } else {
        this.authors = me;
      }
    });

    this.exceptionSubscription = this.syncCollaborationService.onCreateCollaborationException().subscribe((message: any) => {
      this.snackbar.open(message.message, '', { duration: 5000 });
      this.newDrawingForm.enable();
      this.isLoading = false;
      this.dialogRef.disableClose = false;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get author(): AbstractControl {
    return this.newDrawingForm.get('author')!;
  }

  get password(): AbstractControl {
    return this.newDrawingForm.get('password')!;
  }

  get title(): AbstractControl {
    return this.newDrawingForm.get('title')!;
  }

  get type(): AbstractControl {
    return this.newDrawingForm.get('type')!;
  }

  get backgroundColor(): AbstractControl {
    return this.newDrawingForm.get('backgroundColor')!;
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
    if (this.newDrawingForm.valid && this.auth.activeUser) {
      this.newDrawingForm.disable();
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      const payload = {
        userId: this.auth.activeUser.uid,
        creatorId: this.author.value,
        isTeam: this.auth.activeUser.uid !== this.author.value,
        title: this.title.value,
        bgColor: this.backgroundColor.value.hex,
        type: this.type.value,
        password: this.password.value,
      } as ICollaborationCreatePayload
      this.syncCollaborationService.sendCreateCollaboration(payload);
    }
  }

  ngOnDestroy(): void {
    if (this.exceptionSubscription) {
      this.exceptionSubscription.unsubscribe();
    }

    if (this.finishSubscription) {
      this.finishSubscription.unsubscribe();
    }
  }
}
