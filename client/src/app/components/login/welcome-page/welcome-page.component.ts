import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { UserService } from "src/app/services/user.service";
import { User } from "../../../../../../common/communication/user.model";
import axios from "axios";
import { Router } from "@angular/router";

@Component({
  selector: "app-welcome-page",
  templateUrl: "./welcome-page.component.html",
  styleUrls: ["./welcome-page.component.scss"],
})
export class WelcomePageComponent implements OnInit {
  user = new User();
  logInFail: boolean = false;
  loading: boolean = false;

  constructor(public userService: UserService,private router: Router) {}

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
        "https://colorimage-109-3900.herokuapp.com/auth/login",
        PAYLOAD,
        {
          headers: headers,
        }
      );
      console.log(res);
      this.logInFail = false;
      this.router.navigate(['/drawing'], { queryParams: { logInFail: this.logInFail} });
    } catch (error) {
      this.loading = false;
      console.error(error);
      this.logInFail = true;
      throw error;
    }
    this.loading = false;
  }
  onSubmit(): void {
    console.log(this.logInFail)
       this.router.navigate(['/drawing'], { queryParams: { logInFail: this.logInFail} });
       
     }
  
}
