import { Component, OnInit } from '@angular/core';
import { User } from 'firebase';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.scss']
})
export class UserProfileSettingsComponent implements OnInit {
  url: any; //Angular 11, for stricter type
	msg = "";
  user = {
  username: '',
  password: '',} ;
  constructor(private userService:UserService) { 

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
}
