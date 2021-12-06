import { MatSnackBar, MatDialogRef } from '@angular/material';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-update-password-dialog',
  templateUrl: './update-password-dialog.component.html',
  styleUrls: ['./update-password-dialog.component.scss']
})
export class UpdatePasswordDialogComponent implements OnInit {

  isLoading: boolean = false;
  updatePasswordForm: FormGroup;
  constructor(private snackbar: MatSnackBar, private dialogRef: MatDialogRef<UpdatePasswordDialogComponent>, private fb: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.updatePasswordForm = this.fb.group({
      newPassword: ['', [Validators.minLength(8), Validators.maxLength(256), Validators.required]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  get newPassword(): AbstractControl {
    return this.updatePasswordForm.get('newPassword')!;
  }

  get confirmPassword(): AbstractControl {
    return this.updatePasswordForm.get('confirmPassword')!;
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.isLoading = true;
      this.dialogRef.disableClose = true;
      this.userService.updatePassword({
        password: this.newPassword.value
      }).subscribe((c) => {
        this.isLoading = false;
        this.dialogRef.disableClose = false
        this.snackbar.open('Mot de passe mit à jour avec succès!', "OK", { duration: 1500 });
      }, (error) => {
        this.isLoading = false;
        this.snackbar.open(error.message, "OK", { duration: 1500 });
        this.dialogRef.disableClose = false
      })
    }
  }

  onPasswordInput() {
    if (this.updatePasswordForm.hasError('passwordMismatch'))
      this.confirmPassword.setErrors([{ 'passwordMismatch': true }]);
    else
      this.confirmPassword.setErrors(null);
  }

  isValid(): boolean {
    return !this.isLoading && this.confirmPassword.value === this.newPassword.value && this.updatePasswordForm.valid;
  }
}