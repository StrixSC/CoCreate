import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';

import * as firebase from 'firebase';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';


@Component({
  selector: 'app-username-update-dialog',
  templateUrl: './username-update-dialog.component.html',
  styleUrls: ['./username-update-dialog.component.scss']
})
export class UsernameUpdateDialogComponent implements OnInit {
  verifyPasswordForm:FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private dialogRef: MatDialogRef<AvatarDialogComponent>) {
    this.activeUser=this.auth.activeUser
   }
  userAuthenticated: boolean;
  isLoading:boolean = false;
  activeUser: firebase.User |null
  ngOnInit() {

    this.verifyPasswordForm = this.fb.group({
      password: ['', [
        Validators.required
      ]],
    });
  }
  getPassword():string {
    return this.verifyPasswordForm.get('password')!.value
     }
 close() {
  if(this.activeUser!.email)		
  this.activeUser!.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(this.activeUser!.email, this.getPassword())).then(
    success => {
      if (success){
        this.userAuthenticated = true;
        console.log(this.userAuthenticated)
        this.dialogRef.close(this.userAuthenticated)
      } 
     
    })
}

  

    
  
}
