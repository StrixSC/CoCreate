import { AuthService } from './../services/auth/auth.service';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private userService: UserService, private authService: AuthService) {}
	
	canActivate() {
		if(environment.allowNoLogin) {
			return true; 
		}

		if(this.userService.user) {
			return true;
		}

		return this.userService.refreshUser().pipe(
			catchError(() => {
				this.authService.loginFailureRoutine();
				return of(false).pipe(map(() => false))
			}),
			map((data) => {
				if(data) {
					this.authService.loginSuccessRoutine(data);
					return true;
				}
				this.authService.loginFailureRoutine();
				return false
			})
		);
	}

}
