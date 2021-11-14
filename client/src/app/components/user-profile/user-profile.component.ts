import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {

  private isPersonalProfile = true;
  private userName="Name";
  private userEmail="demo-demo@gmail.com";
  private username="username";

  

  constructor() {
   }

  ngOnInit() {
   
  }
}


