import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { AvatarDialogComponent } from './../avatar-dialog/avatar-dialog.component';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { UserResponse } from './../../model/IUser.model';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialog, MatDialogRef } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-update-profile-dialog',
  templateUrl: './update-profile-dialog.component.html',
  styleUrls: ['./update-profile-dialog.component.scss']
})
export class UpdateProfileDialogComponent implements OnInit {

  isLoading: boolean = false;
  updateProfileForm: FormGroup;
  activeFile: File | null = null;
  selectedAvatarUrl: string;
  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<UpdateProfileDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public user: UserResponse
  ) { }

  ngOnInit() {
    this.selectedAvatarUrl = this.user.profile.avatar_url;
    this.updateProfileForm = this.fb.group({
      username: [this.user.profile.username, [
        Validators.minLength(4),
        Validators.maxLength(256),
      ]]
    });
  }

  get username(): AbstractControl {
    return this.updateProfileForm.get('username')!;
  }

  uploadFile(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length >= 1) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(fileList[0].type)) {
        this.snackbar.open("Ce fichier n'est pas valid, SVP utilisez un fichier de format JPEG ou PNG", "OK", { duration: 5000 })
        this.activeFile = null;
        return;
      } else {
        const file = fileList[0];
        const fd = new FormData();
        fd.append('avatar', file);
        this.isLoading = true;
        this.dialogRef.disableClose = true;
        this.userService.uploadAvatar(fd).subscribe((c) => {
          if (c) {
            this.selectedAvatarUrl = c.avatar_url;
            this.snackbar.open("Votre avatar à été mit à jour!", "OK", { duration: 1000 });
          }
          this.dialogRef.disableClose = false;
          this.isLoading = false;
        }, (error) => {
          this.snackbar.open('Erreur lors du téléversement de l\'avatar, veuillez réessayez plus tard...', "OK", { duration: 1000 });
          this.dialogRef.disableClose = false;
          this.isLoading = false;
        })
      }
    }
  }

  triggerAvatarDialog(): void {
    this.dialog.open(AvatarDialogComponent, {
      width: '750px',
      height: '500px',
      data: {
        getUserHistory: true
      }
    }).afterClosed().subscribe((data) => {
      if (data) {
        this.selectedAvatarUrl = data;
        this.activeFile = null
      }
    })
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.isLoading = true;
      this.userService.updateUsernameAndAvatar(this.username.value, this.selectedAvatarUrl).subscribe((c) => {
        if (c) {
          this.snackbar.open('Succès! Les informations on été mise à jour!', "OK", { duration: 1500 })
        }
        this.isLoading = false;
        this.dialogRef.disableClose = false;
      }, (error) => {
        this.snackbar.open(error.message, 'OK', { duration: 3000 });
        this.isLoading = false;
        this.dialogRef.disableClose = false;
      })
    }
  }

  isValid(): boolean {
    return this.updateProfileForm.valid && !this.isLoading && !!this.selectedAvatarUrl;
  }
}
