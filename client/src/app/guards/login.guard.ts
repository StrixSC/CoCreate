import { AuthService } from './../services/auth/auth.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class LoginGuard implements CanActivate {
	constructor(private userService: UserService, private authService: AuthService, private router: Router) {}
	
	canActivate() {
        return this.userService.refreshUser().pipe(
            map((data) => {
                if(data) {
                    console.log(data);
                    this.authService.loginSuccessRoutine(data);
                    this.router.navigateByUrl('drawing');
                    return false;
                } else {
                    return true;
                }
            }),
            catchError(() => of(true).pipe(map(() => true)))
        )
    }
}
