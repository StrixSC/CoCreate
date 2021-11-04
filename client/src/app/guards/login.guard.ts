import { AuthService } from './../services/auth/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class LoginGuard implements CanActivate {
	constructor(private userService: UserService, private authService: AuthService) {}
	
	canActivate() {
        return this.userService.refreshUser().pipe(
            map((data) => {
                console.log(data);
                if(data){
                    this.authService.loginSuccessRoutine(data);
                    return false;
                } else {
                    return true;
                }
            }),
            catchError(() => of(true).pipe(map(() => true)))
        )
    }
}
