import { SocketService } from '../services/chat/socket.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router/*, RouterStateSnapshot, UrlTree*/ } from '@angular/router';
//import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ChatGuard implements CanActivate {
	constructor(private router: Router, private socketService: SocketService) {}
	canActivate(route: ActivatedRouteSnapshot): boolean {
		const username = route.queryParamMap.get("username");
		if(!username || username === "") {
			this.socketService.error = "Le nom d'utilisateur ne peut pas être vide..."
			this.router.navigateByUrl("login");
		}

		return true;
	}
}
