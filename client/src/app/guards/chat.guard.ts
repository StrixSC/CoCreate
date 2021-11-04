import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class ChatGuard implements CanActivate {
	constructor(private router: Router) {}
	canActivate(route: ActivatedRouteSnapshot): boolean {
		const logInFail = route.queryParamMap.get("logInFail");
		console.log(logInFail)
		if(!logInFail) {
			//this.socketService.error = "Le nom d'utilisateur ne peut pas être vide..."
			this.router.navigateByUrl("");
		}

		return true;
	}
}
