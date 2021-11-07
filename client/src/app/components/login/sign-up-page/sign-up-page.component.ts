import { Router } from '@angular/router';
import { AuthService } from './../../../services/auth.service';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from '../../../../../../common/communication/user.model';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent {
  form: NgForm;
  user = {} as User;

  constructor(public authService: AuthService, private router: Router) {}

  resetForm(form?: NgForm) {
    if (form != null) { form.reset(); }
    this.user = {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    };
  }

  register() {
    this.authService.register({
      username: this.user.username,
      email: this.user.email,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      password: this.user.password
    }).subscribe((t: any) => {
      if(t) {
        this.router.navigateByUrl('');
      }
    }, (error: Error | any) => {
      console.error(error);
    });
  }
}
