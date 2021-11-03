import { ChatGuard } from './guards/chat.guard';
import { ChatComponent } from './components/chat/chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//import { LoginPageComponent } from './components/login/login-page/login-page.component';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/login/sign-up-page/sign-up-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';



const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'register', component: SignUpPageComponent },
  { path: 'workspace', component:SidenavComponent},
  { path: 'profile', component:UserProfileComponent},
  { path: "drawing", component: DrawingPageComponent, canActivate: [ChatGuard] },
  { path: "chat", component: ChatComponent},
  { path: 'forgot-password', component:ChangePasswordComponent },
  //{ path: "login", component: LoginPageComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
