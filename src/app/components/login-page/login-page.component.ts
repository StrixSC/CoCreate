import { SocketService } from './../../services/socket.service';
import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {

  username: string;
  constructor(private router: Router, public socketService: SocketService) {
    this.username = "";
  }

  onSubmit(): void {
    this.router.navigate(['/chat'], { queryParams: { username: this.username } });
  }

}
