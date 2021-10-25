import { Component, OnInit } from '@angular/core';
import { User } from '../../../../../common/communication/user.model';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.scss']
})
export class SignUpPageComponent implements OnInit {
  form:NgForm;
  user=new User();

  constructor(public userService:UserService) { 
    
  }

  ngOnInit() {
    
  }


  // resets the form fields of the user
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
    this.userService.registerUser(JSON.stringify(this.user)).subscribe((t) => {
      console.log(t)
    });
  } 
}
