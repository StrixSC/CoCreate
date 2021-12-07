import { ForgotPasswordComponent } from './../forgot-password/forgot-password.component';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { firebaseAuthErrorHandler } from 'src/app/utils/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  options: MatSnackBarConfig = { duration: 5000, verticalPosition: 'top' };
  authSubscription: Subscription;
  isLoading: boolean = false;
  loginForm: FormGroup;
  errorMessage: string | null = null;
  showPassword: boolean = false;
  constructor(private matDialog: MatDialog, private snackbar: MatSnackBar, private router: Router, private auth: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required
      ]],
    });
  }

  forgetPassword(): void {
    this.matDialog.open(ForgotPasswordComponent, { width: '500px' });
  }

  get email(): string {
    return this.loginForm.get('email')!.value;
  }

  get password(): string {
    return this.loginForm.get('password')!.value;
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loginForm.disable();
      this.isLoading = true;

      this.authSubscription = this.auth.signIn({
        email: this.email,
        password: this.password
      }).subscribe((state) => {
        if (state && state.user) {
          this.auth.activeUser = state.user;
          this.isLoading = false;
          this.router.navigateByUrl('/');
        } else {
          this.isLoading = false;
        }
      }, (error) => {
        this.isLoading = false;
        this.loginForm.enable();
        this.snackbar.open(this.handleError(error), '', this.options);
      })
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  handleError(error: firebase.FirebaseError) {
    const handledError = firebaseAuthErrorHandler[error.code];
    if (handledError) {
      return handledError;
    } else return "Oups! Un erreur inconnu à survenu. Veuillez réessayez à nouveau!"
  }

}
