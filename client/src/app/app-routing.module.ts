import { ChatGuard } from './guards/chat.guard';
import { ChatComponent } from './components/chat/chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
//import { SidenavComponent } from './components/sidenav/sidenav.component';

const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: "login", component: LoginPageComponent },
  { path: "drawing", component: DrawingPageComponent, canActivate: [ChatGuard] },
  { path: "chat", component: ChatComponent},
  { path: 'home', component: WelcomePageComponent },
  { path: 'signup', component: SignUpPageComponent },
  { path: 'workspace', component: WorkspaceComponent}

  /*{ path: "**", redirectTo: "chat" }*/
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
   // CommonModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
