import { Component, OnInit } from "@angular/core";
import { User } from "../../../../../../common/communication/user.model";
import { NgForm } from "@angular/forms";
import axios from "axios";
import { environment } from "src/environments/environment";
import { UserService } from "src/app/services/user.service";
import { isDevMode } from '@angular/core';

@Component({
  selector: "app-sign-up-page",
  templateUrl: "./sign-up-page.component.html",
  styleUrls: ["./sign-up-page.component.scss"],
})
export class SignUpPageComponent implements OnInit {
  form: NgForm;
  user = {} as User;
  URL: string;

  constructor(public userService: UserService) {
    this.URL = isDevMode()
    ? environment.serverURL
    : environment.serverURL
  }

  ngOnInit() {}

  // resets the form fields of the user
  resetForm(form?: NgForm) {
    if (form != null) form.reset();
    this.user = {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    };
  }
  mySubmit(f: NgForm) {
    this.userService.register(JSON.stringify(this.user)).subscribe((t) => {
      console.log(t);
    }, (error: Error | any) => {
      console.error(error);
      
    });
  }

  async register() {
    console.log(this.user);
    const PAYLOAD = {
      email: this.user.email,
      password: this.user.password,
      username: this.user.username,
      first_name: this.user.firstName,
      last_name: this.user.lastName,
    };
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      await axios.post(this.URL + "auth/register", PAYLOAD, {
        headers: headers,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
