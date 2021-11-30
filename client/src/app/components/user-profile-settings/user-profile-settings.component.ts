import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';
import { UsernameUpdateDialogComponent } from '../username-update-dialog/username-update-dialog.component';

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.scss']
})
export class UserProfileSettingsComponent implements OnInit {
  	url: any=""; //Angular 11, for stricter type
	msg = "";
	updateUsernameForm: FormGroup;
	updatePasswordForm:FormGroup;
  	private username: string;
  	private password: string |null;
	loading=false;
	activeUser: firebase.User |null
  constructor(private userService:UserService,public dialog: MatDialog,private httpClient:HttpClient,private auth:AuthService,private fb:FormBuilder) { 
	this.activeUser=this.auth.activeUser;
	if(this.activeUser!.displayName !=null)	this.username=this.activeUser!.displayName

  }

  ngOnInit() {

	this.updateUsernameForm = this.fb.group({
		username: ['', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(256)
			  ]],
			})

	this.url=this.activeUser!.photoURL

  }

	selectFile(event: any) { 
		if(!event.target.files[0] || event.target.files[0].length == 0) {
			this.msg = 'You must select an image';
			return;
		}
		
		var mimeType = event.target.files[0].type;
		
		if (mimeType.match(/image\/*/) == null) {
			this.msg = "Only images are supported";
			return;
		}
		
		var reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);
		
		reader.onload = (_event) => {
			this.msg = "";
			this.url = reader.result; 
		}
	}
	submitUpdate() {
		if (this.isValid()) {
      this.updateUsernameForm.disable();
	  const fd = new FormData();
      fd.append('username', this.username)
		}

	}
	openAvatarDialog(): void {
		this.dialog.open(AvatarDialogComponent, {
			width: '750px',
			height: '500px',
		  }).afterClosed().subscribe((data) => {
			if (data) {
			  this.url=data;
			}
		  })
	}
	openUsernameUpdateDialog():void {
		this.dialog.open(UsernameUpdateDialogComponent, {
			width: '550px',
			height: '300px',
		})
	}
	isValid(): boolean {
		return this.updateUsernameForm.valid;
	  }
	  register() {

	  }
}


