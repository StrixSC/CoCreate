import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from '../../../../../common/communication/user.model';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent implements OnInit {
  
  user=new User();
  constructor(public userService:UserService) { }

  ngOnInit() {
  }
  resetForm(form?:NgForm) {
    if(form != null)
    form.reset();
    this.user = {
      username: '',
      email:'',
      firstName:'',
      lastName:'',
      password:''

    }
  }
  mySubmit(f:NgForm){
    console.log("submitted")
    console.log(JSON.stringify(this.user))
    this.userService.loginUser(JSON.stringify(this.user)).subscribe((t) => {
      console.log(t)
    });
  } 

}
