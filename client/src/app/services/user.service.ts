import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from "axios";
import { environment } from "src/environments/environment";
//import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class UserService {
  URL: String = "";

  constructor(private http: HttpClient) {
    this.URL = environment.production
      ? environment.serverURL
      : environment.local;
  }

  registerUser(userInfo: string) {
    console.log(userInfo);
    return this.http.post(this.URL + "auth/register", JSON.parse(userInfo), {
      withCredentials: true,
    });
  }

  async loginUser(user: any) {
    console.log(user);

    const PAYLOAD = {
      email: user.email,
      password: user.password,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const res = await axios.post(URL + "auth/login", PAYLOAD, {
        headers: headers,
      });
      console.log(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
