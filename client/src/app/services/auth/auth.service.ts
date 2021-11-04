import { IUser } from './../../model/IUser.model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { SocketService } from './../chat/socket.service';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    constructor(private socketService: SocketService, private router: Router, private userService: UserService) {}

    loginFailureRoutine() {
		this.userService.user = {} as IUser;
		this.socketService.disconnect();
		this.router.navigateByUrl('');
	}

	loginSuccessRoutine(user: IUser) {
		this.userService.user = user;
		this.socketService.connect();
	}
}
