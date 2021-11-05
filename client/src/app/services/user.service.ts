import { IUser } from "./../model/IUser.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  URL: String = "";
  user: IUser;

  constructor(private http: HttpClient) {
    this.URL = environment.serverURL;
  }

  refreshUser(): Observable<any> {
    return this.http.get(this.URL + "auth/refresh", {
      withCredentials: true,
    });
  }

  register(userInfo: string): Observable<any> {
    return this.http.post(this.URL + "auth/register", JSON.stringify(userInfo));
  }

  login(user: any): Observable<any> {
    const payload = {
      email: user.email,
      password: user.password,
    };

    const headers = {
      "Content-Type": "application/json",
    };

    return this.http.post(this.URL + "auth/login", JSON.stringify(payload), {
      headers,
      withCredentials: true,
    });
  }
}
