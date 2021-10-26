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

  constructor(public userService: UserService) {}

  ngOnInit() {}

  mySubmit(f: NgForm) {
    this.signIn();
  }

  async signIn() {
    console.log(this.user);
    const URL = "http://localhost:3000/auth/login";
    const PAYLOAD = {
      email: this.user.email,
      password: this.user.password,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const res = await axios.post(URL, PAYLOAD, { headers: headers });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  }
}
