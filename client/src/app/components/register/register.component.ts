import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  authSubscription: Subscription;
  isLoading: boolean = false;
  registerForm: FormGroup;
  errorMessage: string | null = null;
  showPassword: boolean = false;
  constructor(private router: Router, private snackbar: MatSnackBar, private auth: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
      ]],
      firstName: ['', [
        Validators.required
      ]],
      lastName: ['', [
        Validators.required
      ]],
    });
  }

  get email(): string {
    return this.registerForm.get('email')!.value;
  }

  get password(): string {
    return this.registerForm.get('password')!.value;
  }

  get username(): string {
    return this.registerForm.get('username')!.value;
  }

  get firstName(): string {
    return this.registerForm.get('firstName')!.value;
  }

  get lastName(): string {
    return this.registerForm.get('lastName')!.value;
  }

  register(): void {
    if (this.registerForm.valid) {
      this.registerForm.disable();
      this.isLoading = true;

      this.authSubscription = this.auth.register({
        email: this.email,
        password: this.password,
        username: this.username,
        first_name: this.firstName,
        last_name: this.lastName
      }).subscribe(() => {
        this.snackbar.open('Votre compte a été crée avec succès! Connectez-vous!', '', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
        this.router.navigateByUrl('auth/login');
        this.isLoading = false;
        this.errorMessage = "";
      }, (error) => {
        console.error(error);
        this.isLoading = false;
        this.registerForm.enable();
        this.errorMessage = error;
      })
    }
  }

}
