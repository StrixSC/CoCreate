//import { SocketService } from '../services/chat/socket.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router/*, RouterStateSnapshot, UrlTree */} from '@angular/router';
//import { Observable } from 'rxjs';

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
