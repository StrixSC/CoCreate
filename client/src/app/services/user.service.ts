import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  //registerBody: string;
  //private readonly BASE_URL: string = 'https://colorimage-109-3900.herokuapp.com/auth/register'
  constructor(private http: HttpClient) { }


  registerUser(userInfo:string){
    console.log(userInfo)
    return this.http.post('https://colorimage-109-3900.herokuapp.com/auth/register', JSON.parse(userInfo),{withCredentials:true});
  }
  loginUser(userInfo:string){
    console.log(userInfo)
    return this.http.post('https://colorimage-109-3900.herokuapp.com/auth/login', JSON.parse(userInfo),{withCredentials:true});
  }

}