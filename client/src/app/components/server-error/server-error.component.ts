import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.scss']
})
export class ServerErrorComponent implements OnInit {

  message: string = "";
  constructor(private auth: AuthService, private router: Router, private activeRoute: ActivatedRoute) { }

  async signOutAndRedirect() {
    this.auth.signOut().subscribe(() => {
      this.router.navigateByUrl('');
    })
  }

  ngOnInit() {
    this.message = this.activeRoute.snapshot.queryParams.message;
    if (!this.message) {
      this.router.navigateByUrl("");
    }
  }
}
