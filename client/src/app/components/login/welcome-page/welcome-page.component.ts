import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { UserService } from "src/app/services/user.service";
import { User } from "../../../../../../common/communication/user.model";
import axios from "axios";

@Component({
  selector: "app-welcome-page",
  templateUrl: "./welcome-page.component.html",
  styleUrls: ["./welcome-page.component.scss"],
})
export class WelcomePageComponent implements OnInit {
  user = new User();
  logInFail: boolean = false;
  loading: boolean = false;
  constructor(public userService: UserService) {}

  ngOnInit() {}

  mySubmit(f: NgForm) {
    this.signIn();
  }

  async signIn() {
    console.log(this.user);

    const PAYLOAD = {
      email: this.user.email,
      password: this.user.password,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      this.loading = true;
      const res = await axios.post(
        "http://localhost:3000/auth/login",
        PAYLOAD,
        {
          headers: headers,
        }
      );
      console.log(res);
      this.logInFail = false;
    } catch (error) {
      this.loading = false;
      console.error(error);
      this.logInFail = true;
      throw error;
    }
    this.loading = false;
  }
}
