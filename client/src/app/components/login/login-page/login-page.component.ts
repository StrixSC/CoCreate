// import { SocketService } from '../../../services/chat/socket.service';
// import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {

  username: string;
  constructor() {
    this.username = '';
  }
}
