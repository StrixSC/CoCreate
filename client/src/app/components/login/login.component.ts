import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  authSubscription: Subscription;
  isLoading: boolean = false;
  loginForm: FormGroup;
  errorMessage: string | null = null;
  showPassword: boolean = false;
  constructor(private router: Router, private auth: AuthService, private fb: FormBuilder) { }

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
        // TODO Handle errors to translate them in french.
        console.error(error);
        this.isLoading = false;
        this.loginForm.enable();
        this.errorMessage = error;
      })
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

}
