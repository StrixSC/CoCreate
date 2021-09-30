import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ChatGuard implements CanActivate {
	constructor(private router: Router) {}
	canActivate(route: ActivatedRouteSnapshot): boolean {
		const username = route.queryParamMap.get("username");
		if(!username || username === "") {
			this.router.navigateByUrl("login");
		}

		return true;
	}

}
