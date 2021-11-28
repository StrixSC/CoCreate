import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { User } from 'firebase';
import { UserService } from 'src/app/services/user.service';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.scss']
})
export class UserProfileSettingsComponent implements OnInit {
  url: any="../assets/105992231-1561667465295gettyimages-521697453.jpeg"; //Angular 11, for stricter type
	msg = "";
  user = {
  username: '',
  password: '',} ;
  constructor(private userService:UserService,public dialog: MatDialog) { 

  }

  ngOnInit() {
  }


	//selectFile(event) { //Angular 8
	selectFile(event: any) { //Angular 11, for stricter type
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
      //console.log(this.url)
		}
	}
	updateProfile(updateProfileBody:any){
		//const updateProfileBodyString = updateProfileBody.toString()
		//const updateProfileBodyJSON=JSON.parse(updateProfileBodyString)
		this.userService.updateProfile(updateProfileBody).subscribe((res)=>{
			console.log(res)
		})
	}
	onSubmit() {
		this.updateProfile({"username":this.user.username,"avatarUrl":this.url})
	}
	openDialog(): void {
		 this.dialog.open(AvatarDialogComponent, {
		  width: '25px',height:'25px'
		});
	}
}


