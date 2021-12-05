import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import * as firebase from 'firebase';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';
import { UsernameUpdateDialogComponent } from '../username-update-dialog/username-update-dialog.component';

@Component({
	selector: 'app-user-profile-settings',
	templateUrl: './user-profile-settings.component.html',
	styleUrls: ['./user-profile-settings.component.scss']
})
export class UserProfileSettingsComponent implements OnInit {
	url: any = ""; //Angular 11, for stricter type
	msg = "";
	updateUsernameForm: FormGroup;
	updatePasswordForm: FormGroup;
	private username: string;
	loading = false;
	activeUser: firebase.User | null
	showPassword: boolean = false;
	onChangeUsername: boolean = false;

	constructor(private userService: UserService, public dialog: MatDialog, private httpClient: HttpClient, private auth: AuthService, private fb: FormBuilder) {
		this.activeUser = this.auth.activeUser;
		if (this.activeUser!.displayName != null) this.username = this.activeUser!.displayName
	}

	ngOnInit() {
		//this.updateUsernameForm.enable;
		this.onChangeUsername = false;
		this.updateUsernameForm = this.fb.group({
			username: ['', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(256)
			]],
		})
		this.updatePasswordForm = this.fb.group({
			currentPassword: ['', [
				Validators.required
			]],
			newPassword: ['', [
				Validators.required
			]],
			newPasswordConfirm: ['', [
				Validators.required
			]],
		})

		this.url = this.activeUser!.photoURL
	}
	getNewUsername(): string {
		return this.updateUsernameForm.get('username')!.value
	}

	getCurrentPassword(): string {
		return this.updatePasswordForm.get('currentPassword')!.value
	}
	getNewPassword(): string {
		return this.updatePasswordForm.get('newPassword')!.value
	}
	getNewPasswordConfirm(): string {
		return this.updatePasswordForm.get('newPasswordConfirm')!.value
	}

	selectFile(event: any) {
		if (!event.target.files[0] || event.target.files[0].length == 0) {
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


			console.log(this.url)
			this.userService.updateUsernameAndAvatar(this.username, this.url).subscribe(res => {
			});
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
				this.url = data
				this.userService.updateUsernameAndAvatar(this.username, data).subscribe(res => {

				});


			}
		})
	}
	openUsernameUpdateDialog(): void {
		this.dialog.open(UsernameUpdateDialogComponent, {
			width: '550px',
			height: '300px',
		}).afterClosed().subscribe((data) => {
			if (data) {
				this.userService.updateUsernameAndAvatar(this.getNewUsername(), this.url).subscribe(res => {
					this.username = this.getNewUsername()
					this.onChangeUsername = true;
					this.updateUsernameForm.disabled;
				})
			}
		})
	}
	isValid(): boolean {
		return this.updateUsernameForm.valid;
	}
	updatePassword() {
		if (this.activeUser!.email)
			this.activeUser!.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(this.activeUser!.email, this.getCurrentPassword())).then(
				success => {
					if (this.updatePasswordForm.valid && (this.getNewPassword() == this.getNewPasswordConfirm())) {
						this.userService.updatePassword({ "password": this.updatePasswordForm.get('newPassword')!.value }).subscribe((password) => {
						})
						console.log("passwordchanged")
					}
					else {
						console.log("error")
					}
				})

	}
}


