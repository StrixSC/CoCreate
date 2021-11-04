import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawingPageComponent } from './components/drawing-page/drawing-page.component';
import { WelcomePageComponent } from './components/login/welcome-page/welcome-page.component';
import { SignUpPageComponent } from './components/login/sign-up-page/sign-up-page.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';

const routes: Routes = [
  { path: '', component: WelcomePageComponent, canActivate: [LoginGuard] },
  { path: 'register', component: SignUpPageComponent, canActivate: [LoginGuard] },
  { path: 'workspace', component:SidenavComponent},
  { path: 'profile', component:UserProfileComponent},
  { path: "drawing", component: DrawingPageComponent, canActivate: [AuthGuard] },
  { path: "chat", component: ChatComponent},
  { path: 'forgot-password', component:ChangePasswordComponent },
  { path: "**", redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
